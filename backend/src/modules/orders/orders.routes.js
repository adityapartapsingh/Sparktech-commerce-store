const express = require('express');
const router = express.Router();
const Order = require('../../models/Order.model');
const Product = require('../../models/Product.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const validate = require('../../middleware/validate.middleware');
const { CancelOrderSchema, ReturnOrderSchema, UpdateOrderStatusSchema, UpdateDeliverySchema } = require('../schemas');
const AppError = require('../../utils/AppError');
const User = require('../../models/User.model');
const logger = require('../../utils/logger');
const { sendCancellationSMS, sendShippedSMS } = require('../../utils/sms.service');

// Customer: get own orders
router.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  sendSuccess(res, orders, 'Orders fetched');
}));

// Customer: get single order
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name slug images');
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }
  sendSuccess(res, order, 'Order fetched');
}));

// Admin: list all orders
router.get('/', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);
  sendSuccess(res, { orders, total, page }, 'All orders fetched');
}));

// Admin: update order status
router.patch('/:id/status', protect, authorize('admin', 'masteradmin'), validate(UpdateOrderStatusSchema), asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(trackingNumber && { trackingNumber }) },
    { returnDocument: 'after' }
  );
  if (!order) throw new AppError('Order not found', 404);
  sendSuccess(res, order, 'Order status updated');
}));

// Customer: cancel order (only before shipping)
router.post('/:id/cancel', protect, validate(CancelOrderSchema), asyncHandler(async (req, res) => {
  const { reason, comment } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user._id.toString()) throw new AppError('Not authorized', 403);

  const cancellable = ['pending', 'paid', 'processing'];
  if (!cancellable.includes(order.status)) {
    throw new AppError(
      order.status === 'shipped' || order.status === 'delivered'
        ? 'Order has already been shipped. Please raise a return request instead.'
        : 'This order cannot be cancelled.',
      400
    );
  }

  order.status = 'cancelled';
  order.cancellationReason = reason ? (comment ? `${reason} — ${comment}` : reason) : 'No reason provided';
  order.cancelledAt = new Date();
  await order.save();

  // Re-increment stock for each item in the cancelled order
  await Promise.all(
    order.items.map((item) =>
      Product.findOneAndUpdate(
        { _id: item.product, 'variants._id': item.variant },
        { $inc: { 'variants.$.stock': item.quantity } }
      )
    )
  );

  // Send cancellation SMS (non-blocking)
  const cancelUser = await User.findById(order.user).select('phone');
  if (cancelUser?.phone) {
    sendCancellationSMS(cancelUser.phone, order._id)
      .catch((e) => logger.error(`Cancel SMS failed: ${e.message}`));
  }

  sendSuccess(res, { orderId: order._id }, 'Order cancelled successfully');
}));

// Customer: request return / replacement
router.post('/:id/return', protect, validate(ReturnOrderSchema), asyncHandler(async (req, res) => {
  const { type, reason, description, itemsAffected, preferredResolution, contactPhone, bankAccount } = req.body;
  if (!reason) throw new AppError('Reason is required', 400);
  if (!description || description.length < 20) throw new AppError('Please provide at least 20 characters describing the issue', 400);

  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  if (order.user.toString() !== req.user._id.toString()) throw new AppError('Not authorized', 403);
  if (order.status !== 'delivered') throw new AppError('Only delivered orders can be returned or replaced', 400);
  if (order.returnRequest?.status && !['rejected'].includes(order.returnRequest.status)) {
    throw new AppError('A return/replacement request is already open for this order', 400);
  }

  order.returnRequest = {
    type:               type || 'return',
    reason,
    description,
    itemsAffected:      itemsAffected || [],
    preferredResolution:preferredResolution || '',
    contactPhone:       contactPhone || '',
    bankAccount:        bankAccount || '',
    status:             'pending',
    requestedAt:        new Date(),
  };
  await order.save();
  sendSuccess(res, { orderId: order._id }, 'Return/replacement request submitted. Our team will contact you within 24 hours.');
}));

// Admin: update delivery info
router.put('/:id/delivery', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const { provider, trackingUrl, trackingNumber } = req.body;
  
  const updateData = {
    'deliveryInfo.provider': provider,
    'deliveryInfo.trackingUrl': trackingUrl,
    trackingNumber: trackingNumber,
    status: 'shipped',
  };
  
  // If not previously dispatched, set dispatchedAt
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);
  
  if (!order.deliveryInfo?.dispatchedAt) {
    updateData['deliveryInfo.dispatchedAt'] = new Date();
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  // Send shipped SMS with tracking info (non-blocking)
  const orderUser = await User.findById(order.user).select('phone');
  if (orderUser?.phone) {
    sendShippedSMS(orderUser.phone, order._id, trackingNumber, provider)
      .catch((e) => logger.error(`Shipped SMS failed: ${e.message}`));
  }

  sendSuccess(res, updatedOrder, 'Delivery information updated successfully');
}));

module.exports = router;

