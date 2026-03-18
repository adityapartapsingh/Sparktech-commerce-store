const Razorpay = require('razorpay');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const Order = require('../../models/Order.model');
const User = require('../../models/User.model');
const Product = require('../../models/Product.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const AppError = require('../../utils/AppError');
const { sendEmail, orderConfirmationEmail } = require('../../utils/sendEmail');
const logger = require('../../utils/logger');

// Lazy init — reads env vars after dotenv.config() has run
let _razorpay;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// ─── Step 1: Create Razorpay Order ──────────────────────────────────────────
// Frontend calls this first to get an order_id, then opens the Razorpay modal.
router.post('/create-order', protect, asyncHandler(async (req, res) => {
  const { shippingAddress } = req.body;
  const user = await User.findById(req.user._id).populate('cart.product');

  if (!user?.cart?.length) throw new AppError('Your cart is empty', 400);

  // Build items and validate stock
  const orderItems = [];
  let totalAmount = 0;

  for (const item of user.cart) {
    const product = item.product;
    if (!product || !product.isActive) {
      throw new AppError(`${product?.name || 'A product'} is no longer available`, 400);
    }
    const variant = product.variants.id(item.variant);
    if (!variant) throw new AppError('Product variant not found', 404);
    if (variant.stock < item.quantity) {
      throw new AppError(`Only ${variant.stock} of ${product.name} (${variant.label}) in stock`, 400);
    }

    const lineTotal = variant.price * item.quantity;
    totalAmount += lineTotal;

    orderItems.push({
      product:      product._id,
      variant:      item.variant,
      name:         product.name,
      variantLabel: variant.label,
      image:        product.images?.[0],
      price:        variant.price,
      quantity:     item.quantity,
    });
  }

  // Create a pending order in our DB first
  const dbOrder = await Order.create({
    user:            req.user._id,
    items:           orderItems,
    totalAmount,
    shippingAddress,
    status:          'pending',
    razorpayOrderId: 'temp',           // placeholder; replaced below
  });

  // Create Razorpay order (amount in paise)
  const rzpOrder = await getRazorpay().orders.create({
    amount:          Math.round(totalAmount * 100),
    currency:        'INR',
    receipt:         dbOrder._id.toString(),
    notes: {
      dbOrderId: dbOrder._id.toString(),
      userId:    req.user._id.toString(),
    },
  });

  // Attach Razorpay order ID to our DB order
  await Order.findByIdAndUpdate(dbOrder._id, { razorpayOrderId: rzpOrder.id });

  sendSuccess(res, {
    orderId:       dbOrder._id,
    razorpayOrderId: rzpOrder.id,
    amount:        rzpOrder.amount,
    currency:      rzpOrder.currency,
    keyId:         process.env.RAZORPAY_KEY_ID,
  }, 'Razorpay order created');
}));

// ─── Step 2: Verify Payment (called after Razorpay modal success) ─────────────
// Frontend sends { razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post('/verify', protect, asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

  // Verify signature (idempotency + authenticity)
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    throw new AppError('Payment verification failed — signature mismatch', 400);
  }

  // Idempotency: already confirmed?
  const order = await Order.findById(dbOrderId);
  if (!order) throw new AppError('Order not found', 404);
  if (order.status === 'paid') {
    return sendSuccess(res, { orderId: order._id }, 'Already processed');
  }

  // Mark as paid
  await Order.findByIdAndUpdate(dbOrderId, {
    status:            'paid',
    razorpayPaymentId: razorpay_payment_id,
  });

  // Reduce stock and clear cart in parallel
  await Promise.all([
    ...order.items.map((item) =>
      Product.findOneAndUpdate(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': -item.quantity } }
      )
    ),
    User.findByIdAndUpdate(order.user, { $set: { cart: [] } }),
  ]);

  // Send confirmation email (non-blocking)
  sendEmail({
    to:      req.user.email,
    subject: 'Order Confirmed — RoboMart ⚡',
    html:    orderConfirmationEmail(order),
  }).catch((e) => logger.error(`Email send failed: ${e.message}`));

  sendSuccess(res, { orderId: order._id }, 'Payment verified and order confirmed');
}));

// ─── Step 3: Razorpay Webhook (optional — for server-side event handling) ──────
// Razorpay signs webhook payloads differently from Stripe.
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (webhookSecret) {
    const signature = req.headers['x-razorpay-signature'];
    const expectedSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (expectedSig !== signature) {
      logger.warn('Razorpay webhook signature mismatch');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  logger.info(`Razorpay webhook: ${event.event}`);

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const notes   = payment.notes || {};

    if (notes.dbOrderId) {
      const existing = await Order.findOne({ _id: notes.dbOrderId, status: { $ne: 'pending' } });
      if (!existing) {
        await Order.findByIdAndUpdate(notes.dbOrderId, {
          status:            'paid',
          razorpayPaymentId: payment.id,
        });
        logger.info(`Order ${notes.dbOrderId} marked paid via webhook`);
      }
    }
  }

  res.json({ received: true });
});

// ─── Get Razorpay Key for frontend ────────────────────────────────────────────
router.get('/config', protect, (req, res) => {
  sendSuccess(res, { keyId: process.env.RAZORPAY_KEY_ID }, 'Razorpay config');
});

module.exports = router;
