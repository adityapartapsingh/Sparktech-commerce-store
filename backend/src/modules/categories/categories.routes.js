const express = require('express');
const router = express.Router();
const Category = require('../../models/Category.model');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');

router.get('/', asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder name').populate('parent', 'name slug');
  sendSuccess(res, categories, 'Categories fetched');
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw new AppError('Category not found', 404);
  sendSuccess(res, category, 'Category fetched');
}));

router.post('/', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  // Check if name already exists
  const existing = await Category.findOne({ name });
  if (existing) {
    throw new AppError(`Category "${name}" already exists`, 400);
  }

  if (!req.body.slug) {
    req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
  }
  const category = await Category.create(req.body);
  sendSuccess(res, category, 'Category created', 201);
}));

router.put('/:id', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
  if (!category) throw new AppError('Category not found', 404);
  sendSuccess(res, category, 'Category updated');
}));

router.delete('/:id', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const categoryId = req.params.id;
  // Delete the category itself
  await Category.findByIdAndDelete(categoryId);
  // Delete all subcategories
  await Category.deleteMany({ parent: categoryId });
  
  sendSuccess(res, {}, 'Category and its subcategories deleted');
}));

module.exports = router;
