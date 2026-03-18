const express = require('express');
const router = express.Router();
const User = require('../../models/User.model');
const Product = require('../../models/Product.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');
const { protect } = require('../../middleware/auth.middleware');

// Cart is stored as embedded array in User document
router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({ path: 'cart.product', select: 'name slug images variants isActive' });
  sendSuccess(res, user?.cart || [], 'Cart fetched');
}));

router.post('/add', protect, asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  const variant = product.variants.id(variantId);
  if (!variant) throw new AppError('Variant not found', 404);
  if (variant.stock < quantity) throw new AppError(`Only ${variant.stock} items in stock`, 400);

  const user = await User.findById(req.user._id);
  const existingIdx = user.cart?.findIndex(
    (item) => item.product.toString() === productId && item.variant.toString() === variantId
  );

  if (existingIdx !== undefined && existingIdx >= 0) {
    user.cart[existingIdx].quantity = Math.min(
      user.cart[existingIdx].quantity + quantity,
      variant.stock
    );
  } else {
    user.cart = user.cart || [];
    user.cart.push({ product: productId, variant: variantId, quantity });
  }

  await user.save();
  sendSuccess(res, user.cart, 'Item added to cart');
}));

router.patch('/update', protect, asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;
  const user = await User.findById(req.user._id);
  const item = user.cart?.find(
    (i) => i.product.toString() === productId && i.variant.toString() === variantId
  );
  if (!item) throw new AppError('Item not in cart', 404);
  if (quantity < 1) {
    user.cart = user.cart.filter(
      (i) => !(i.product.toString() === productId && i.variant.toString() === variantId)
    );
  } else {
    item.quantity = quantity;
  }
  await user.save();
  sendSuccess(res, user.cart, 'Cart updated');
}));

router.delete('/remove/:productId/:variantId', protect, asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { cart: { product: productId, variant: variantId } },
  });
  sendSuccess(res, {}, 'Item removed from cart');
}));

router.delete('/clear', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
  sendSuccess(res, {}, 'Cart cleared');
}));

module.exports = router;
