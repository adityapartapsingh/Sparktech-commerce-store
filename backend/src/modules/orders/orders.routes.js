const express = require('express');
const router = express.Router();
const Order = require('../../models/Order.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const AppError = require('../../utils/AppError');

// Customer: get own orders
router.get('/my', protect, asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
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
router.get('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
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
router.patch('/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(trackingNumber && { trackingNumber }) },
    { new: true }
  );
  if (!order) throw new AppError('Order not found', 404);
  sendSuccess(res, order, 'Order status updated');
}));

module.exports = router;
