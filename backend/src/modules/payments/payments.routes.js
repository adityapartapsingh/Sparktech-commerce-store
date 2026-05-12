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
const validate = require('../../middleware/validate.middleware');
const { CreateOrderSchema, VerifyPaymentSchema, CODOrderSchema } = require('../schemas');
const { sendOrderConfirmationSMS } = require('../../utils/sms.service');

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

// ─── Delivery Calc Helper ───────────────────────────────────────────────────
const calculateDelivery = (subtotal) => {
  const fee = subtotal >= 500 ? 0 : 50;
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5); // Base 5 day ETA
  return { fee, estimatedDelivery };
};

// ─── Step 1: Create Razorpay Order ──────────────────────────────────────────
// Frontend calls this first to get an order_id, then opens the Razorpay modal.
router.post('/create-order', protect, validate(CreateOrderSchema), asyncHandler(async (req, res) => {
  const { shippingAddress, cartItems } = req.body;
  const user = await User.findById(req.user._id).populate('cart.product');

  // Use DB cart if populated, otherwise fall back to cartItems sent from frontend (Zustand store)
  const cartSource = user?.cart?.length ? 'db' : 'frontend';

  if (cartSource === 'frontend' && (!cartItems || !cartItems.length)) {
    throw new AppError('Your cart is empty', 400);
  }

  const orderItems = [];
  let totalAmount = 0;

  if (cartSource === 'db') {
    // Validate from DB cart (with full product data)
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
  } else {
    // Use cartItems from frontend (Zustand store) — trust the data but validate stock
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        throw new AppError(`${item.name || 'A product'} is no longer available`, 400);
      }
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new AppError(`Variant not found for ${item.name}`, 404);
      if (variant.stock < item.quantity) {
        throw new AppError(`Only ${variant.stock} of ${product.name} (${variant.label}) in stock`, 400);
      }
      const lineTotal = variant.price * item.quantity;
      totalAmount += lineTotal;
      orderItems.push({
        product:      product._id,
        variant:      variant._id,
        name:         product.name,
        variantLabel: variant.label,
        image:        product.images?.[0],
        price:        variant.price,
        quantity:     item.quantity,
      });
    }

    // Sync to DB cart for consistency
    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        cart: cartItems.map(i => ({ product: i.productId, variant: i.variantId, quantity: i.quantity }))
      }
    });
  }

  // Calculate Delivery Fee & Estimate
  const { fee: deliveryFee, estimatedDelivery } = calculateDelivery(totalAmount);
  totalAmount += deliveryFee;

  // Create a pending order in our DB first
  const dbOrder = await Order.create({
    user:            req.user._id,
    items:           orderItems,
    totalAmount,
    shippingAddress,
    status:          'pending',
    razorpayOrderId: 'temp',
    deliveryInfo: {
      fee: deliveryFee,
      estimatedDelivery,
    }
  });

  // Create Razorpay order (amount in paise)
  // Razorpay SDK throws plain objects (not Errors) on failure, so we wrap the call
  let rzpOrder;
  try {
    rzpOrder = await getRazorpay().orders.create({
      amount:   Math.round(totalAmount * 100),
      currency: 'INR',
      receipt:  dbOrder._id.toString(),
      notes: {
        dbOrderId: dbOrder._id.toString(),
        userId:    req.user._id.toString(),
      },
    });
  } catch (rzpErr) {
    // Clean up the pending DB order so it doesn't linger
    await Order.findByIdAndDelete(dbOrder._id);
    const msg = rzpErr?.error?.description || rzpErr?.message || 'Razorpay order creation failed';
    throw new AppError(msg, rzpErr?.statusCode || 502);
  }

  await Order.findByIdAndUpdate(dbOrder._id, { razorpayOrderId: rzpOrder.id });

  sendSuccess(res, {
    orderId:         dbOrder._id,
    razorpayOrderId: rzpOrder.id,
    amount:          rzpOrder.amount,
    currency:        rzpOrder.currency,
    keyId:           process.env.RAZORPAY_KEY_ID,
  }, 'Razorpay order created');
}));

// ─── Step 2: Verify Payment (called after Razorpay modal success) ─────────────
// Frontend sends { razorpay_order_id, razorpay_payment_id, razorpay_signature }
router.post('/verify', protect, validate(VerifyPaymentSchema), asyncHandler(async (req, res) => {
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
    'paymentInfo.method': 'razorpay',
    'paymentInfo.status': 'paid',
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
    subject: 'Order Confirmed — SparkTech ⚡',
    html:    orderConfirmationEmail(order),
  }).catch((e) => logger.error(`Email send failed: ${e.message}`));

  // Send confirmation SMS (non-blocking)
  sendOrderConfirmationSMS(req.user.phone, order._id, order.totalAmount)
    .catch((e) => logger.error(`SMS send failed: ${e.message}`));

  sendSuccess(res, { orderId: order._id }, 'Payment verified and order confirmed');
}));


// ─── COD: Place order without online payment ─────────────────────────────────
router.post('/cod', protect, validate(CODOrderSchema), asyncHandler(async (req, res) => {
  const { shippingAddress, cartItems } = req.body;
  const user = await User.findById(req.user._id).populate('cart.product');

  const cartSource = user?.cart?.length ? 'db' : 'frontend';
  if (cartSource === 'frontend' && (!cartItems || !cartItems.length)) {
    throw new AppError('Your cart is empty', 400);
  }

  const orderItems = [];
  let totalAmount = 0;

  if (cartSource === 'db') {
    for (const item of user.cart) {
      const product = item.product;
      if (!product || !product.isActive) throw new AppError(`${product?.name || 'A product'} is no longer available`, 400);
      const variant = product.variants.id(item.variant);
      if (!variant) throw new AppError('Product variant not found', 404);
      if (variant.stock < item.quantity) throw new AppError(`Only ${variant.stock} of ${product.name} left in stock`, 400);
      totalAmount += variant.price * item.quantity;
      orderItems.push({ product: product._id, variant: item.variant, name: product.name, variantLabel: variant.label, image: product.images?.[0], price: variant.price, quantity: item.quantity });
    }
  } else {
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) throw new AppError(`${item.name || 'A product'} is no longer available`, 400);
      const variant = product.variants.id(item.variantId);
      if (!variant) throw new AppError(`Variant not found for ${item.name}`, 404);
      if (variant.stock < item.quantity) throw new AppError(`Only ${variant.stock} of ${product.name} left in stock`, 400);
      totalAmount += variant.price * item.quantity;
      orderItems.push({ product: product._id, variant: variant._id, name: product.name, variantLabel: variant.label, image: product.images?.[0], price: variant.price, quantity: item.quantity });
    }
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: cartItems.map(i => ({ product: i.productId, variant: i.variantId, quantity: i.quantity })) } });
  }

  // Calculate Delivery Fee & Estimate
  const { fee: deliveryFee, estimatedDelivery } = calculateDelivery(totalAmount);
  totalAmount += deliveryFee;

  // Create order — immediately set to 'processing' (COD doesn't need payment confirmation)
  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
    status: 'processing',
    paymentInfo: { method: 'cod', status: 'unpaid' },
    razorpayOrderId: 'cod',
    deliveryInfo: {
      fee: deliveryFee,
      estimatedDelivery,
    }
  });

  // Reduce stock and clear cart
  await Promise.all([
    ...orderItems.map((item) =>
      Product.findOneAndUpdate(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': -item.quantity } }
      )
    ),
    User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } }),
  ]);

  // Send confirmation email (non-blocking)
  sendEmail({
    to:      req.user.email,
    subject: 'Order Placed (COD) — SparkTech ⚡',
    html:    orderConfirmationEmail(order),
  }).catch((e) => logger.error(`COD email failed: ${e.message}`));

  // Send confirmation SMS (non-blocking)
  sendOrderConfirmationSMS(req.user.phone, order._id, order.totalAmount)
    .catch((e) => logger.error(`COD SMS failed: ${e.message}`));

  sendSuccess(res, { orderId: order._id }, 'COD order placed successfully', 201);
}));

// ─── Step 3: Razorpay Webhook ─────────────────────────────────────────────────
// Razorpay sends webhook events for payment status changes (capture, failed, etc.)
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
