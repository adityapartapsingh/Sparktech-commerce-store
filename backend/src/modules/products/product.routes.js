const express = require('express');
const router = express.Router();
const ProductController = require('./product.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { uploadProductImages } = require('../../middleware/upload.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const Feedback = require('../../models/Feedback.model');
const AppError = require('../../utils/AppError');
const Product = require('../../models/Product.model');

router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:slug', ProductController.getProduct);

// Admin only
router.post('/', protect, authorize('admin', 'masteradmin'), uploadProductImages.array('images', 10), ProductController.createProduct);
router.put('/:id', protect, authorize('admin', 'masteradmin'), uploadProductImages.array('images', 10), ProductController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'masteradmin'), ProductController.deleteProduct);

// Customer: submit feedback / complaint / suggestion
router.post('/:slug/feedback', protect, asyncHandler(async (req, res) => {
  const { type, message, rating, orderId } = req.body;
  if (!message || message.length < 10) throw new AppError('Message must be at least 10 characters', 400);
  if (!['complaint', 'suggestion', 'feedback', 'compliment'].includes(type)) {
    throw new AppError('Invalid feedback type', 400);
  }
  const product = await Product.findOne({ $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[a-f\d]{24}$/i) ? req.params.slug : null }] });
  if (!product) throw new AppError('Product not found', 404);

  const feedback = await Feedback.create({
    user:    req.user._id,
    product: product._id,
    order:   orderId || undefined,
    type, message,
    rating:  rating ? Number(rating) : undefined,
  });
  sendSuccess(res, { id: feedback._id }, 'Feedback submitted. Thank you!', 201);
}));

// Admin: list feedback for a product
router.get('/:slug/feedback', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new AppError('Product not found', 404);
  const feedbacks = await Feedback.find({ product: product._id })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });
  sendSuccess(res, feedbacks, 'Feedback fetched');
}));

module.exports = router;

