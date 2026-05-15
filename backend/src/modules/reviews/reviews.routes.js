const express = require('express');
const router = express.Router();
const Review = require('../../models/Review.model');
const Order = require('../../models/Order.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const validate = require('../../middleware/validate.middleware');
const { CreateReviewSchema } = require('../schemas');
const AppError = require('../../utils/AppError');

// Get all reviews for a product (public)
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  sendSuccess(res, reviews, 'Reviews fetched');
}));

// Get all order/product pairs the user has already reviewed
router.get('/my-reviewed-items', protect, asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).select('product order');
  const reviewedItems = reviews.map(r => ({ order: r.order, product: r.product }));
  sendSuccess(res, reviewedItems, 'Reviewed items fetched');
}));

// Check if current user can review a product (has a delivered order containing it)
router.get('/can-review/:productId', protect, asyncHandler(async (req, res) => {
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    status: 'delivered',
    'items.product': req.params.productId,
  });
  const alreadyReviewed = await Review.findOne({
    product: req.params.productId,
    user: req.user._id,
  });
  sendSuccess(res, {
    canReview: !!deliveredOrder && !alreadyReviewed,
    hasPurchased: !!deliveredOrder,
    hasReviewed: !!alreadyReviewed,
  }, 'Review eligibility checked');
}));

// Submit a review — ONLY if user has a delivered order for this product
router.post('/', protect, validate(CreateReviewSchema), asyncHandler(async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  let { orderId } = req.body;

  // If orderId is not explicitly provided (e.g., from Product Details Page), find an unreviewed delivered order
  if (!orderId) {
    const deliveredOrders = await Order.find({
      user: req.user._id,
      status: 'delivered',
      'items.product': productId,
    }).sort({ createdAt: -1 });

    if (deliveredOrders.length === 0) {
      throw new AppError('You can only review products from a delivered order', 403);
    }

    const existingReviews = await Review.find({ product: productId, user: req.user._id });
    const reviewedOrderIds = existingReviews.map(r => r.order.toString());

    const unreviewedOrder = deliveredOrders.find(o => !reviewedOrderIds.includes(o._id.toString()));

    if (!unreviewedOrder) {
      throw new AppError('You have already reviewed this product from all your orders', 409);
    }
    
    orderId = unreviewedOrder._id;
  } else {
    // Check purchase verification for this specific order
    const deliveredOrder = await Order.findOne({
      _id: orderId,
      user: req.user._id,
      status: 'delivered',
      'items.product': productId,
    });
    if (!deliveredOrder) {
      throw new AppError('You can only review products from a delivered order', 403);
    }

    // Check duplicate for this specific order
    const existing = await Review.findOne({ order: orderId, product: productId, user: req.user._id });
    if (existing) throw new AppError('You have already reviewed this product from this order', 409);
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating,
    title,
    comment,
    verified: true,
    order: orderId,
  });
  sendSuccess(res, review, 'Review added', 201);
}));

// Delete own review (or admin can delete any)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  if (review.user.toString() !== req.user._id.toString() && !['admin', 'masteradmin'].includes(req.user.role)) {
    throw new AppError('Not authorized to delete this review', 403);
  }
  await review.deleteOne();
  sendSuccess(res, {}, 'Review deleted');
}));

// Admin: add remarks to a review (public response)
router.patch('/:id/remark', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const { adminRemarks } = req.body;
  if (!adminRemarks || adminRemarks.trim().length < 2) {
    throw new AppError('Remarks must be at least 2 characters', 400);
  }
  const review = await Review.findByIdAndUpdate(req.params.id, {
    adminRemarks: adminRemarks.trim(),
    remarkedBy: req.user._id,
    remarkedAt: new Date(),
  }, { returnDocument: 'after' }).populate('user', 'name avatar');

  if (!review) throw new AppError('Review not found', 404);
  sendSuccess(res, review, 'Admin remarks added');
}));

module.exports = router;
