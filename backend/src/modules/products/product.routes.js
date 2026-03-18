const express = require('express');
const router = express.Router();
const ProductController = require('./product.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const { uploadProductImages } = require('../../middleware/upload.middleware');

router.get('/', ProductController.getProducts);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/:slug', ProductController.getProduct);

// Admin only
router.post('/', protect, authorize('admin', 'masteradmin'), uploadProductImages.array('images', 10), ProductController.createProduct);
router.put('/:id', protect, authorize('admin', 'masteradmin'), uploadProductImages.array('images', 10), ProductController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'masteradmin'), ProductController.deleteProduct);

module.exports = router;
