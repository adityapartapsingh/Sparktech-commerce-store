const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const ProductService = require('./product.service');

exports.getProducts = asyncHandler(async (req, res) => {
  const data = await ProductService.getProducts(req.query);
  sendSuccess(res, data, 'Products fetched');
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.getProduct(req.params.slug);
  sendSuccess(res, product, 'Product fetched');
});

exports.getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await ProductService.getFeaturedProducts();
  sendSuccess(res, products, 'Featured products fetched');
});

exports.createProduct = asyncHandler(async (req, res) => {
  // Attach uploaded image URLs from Cloudinary
  if (req.files?.length) {
    req.body.images = req.files.map((f) => f.path);
  }
  if (!req.body.slug) {
    req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  req.body.variants = JSON.parse(req.body.variants || '[]');
  req.body.attributes = JSON.parse(req.body.attributes || '[]');
  
  if (req.body.tags) {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (e) {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  } else {
    req.body.tags = [];
  }
  
  req.body.createdBy = req.user._id;

  const product = await ProductService.createProduct(req.body);
  sendSuccess(res, product, 'Product created', 201);
});

exports.updateProduct = asyncHandler(async (req, res) => {
  if (req.files?.length) req.body.images = req.files.map((f) => f.path);
  if (req.body.variants) req.body.variants = JSON.parse(req.body.variants);
  if (req.body.attributes) req.body.attributes = JSON.parse(req.body.attributes);
  if (req.body.tags) {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (e) {
      req.body.tags = req.body.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  const product = await ProductService.updateProduct(req.params.id, req.body);
  sendSuccess(res, product, 'Product updated');
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);
  sendSuccess(res, {}, 'Product deleted');
});
