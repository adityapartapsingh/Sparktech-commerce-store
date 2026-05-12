const express = require('express');
const router = express.Router();
const Review = require('../../models/Review.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { CreateReviewSchema } = require('../schemas');
const AppError = require('../../utils/AppError');

router.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  sendSuccess(res, reviews, 'Reviews fetched');
}));

router.post('/', protect, validate(CreateReviewSchema), asyncHandler(async (req, res) => {
  const existing = await Review.findOne({ product: req.body.productId, user: req.user._id });
  if (existing) throw new AppError('You have already reviewed this product', 409);

  const review = await Review.create({
    product: req.body.productId,
    user: req.user._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
  });
  sendSuccess(res, review, 'Review added', 201);
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this review', 403);
  }
  await review.deleteOne();
  sendSuccess(res, {}, 'Review deleted');
}));

module.exports = router;
