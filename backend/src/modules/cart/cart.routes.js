const express = require('express');
const router = express.Router();
const User = require('../../models/User.model');
const Product = require('../../models/Product.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');
const { protect } = require('../../middleware/auth.middleware');

// Cart is stored as embedded array in User document
router.get('/', asyncHandler(async (req, res) => {
  if (req.user) {
    const user = await User.findById(req.user._id)
      .populate({ path: 'cart.product', select: 'name slug images variants isActive' });
    sendSuccess(res, user?.cart || [], 'Cart fetched');
  } else {
    sendSuccess(res, req.session.cart || [], 'Guest cart fetched');
  }
}));

router.post('/add', asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) throw new AppError('Product not found', 404);

  const variant = product.variants.id(variantId);
  if (!variant) throw new AppError('Variant not found', 404);
  if (variant.stock < quantity) throw new AppError(`Only ${variant.stock} items in stock`, 400);

  if (req.user) {
    // User cart
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
  } else {
    // Guest cart
    req.session.cart = req.session.cart || [];
    const cart = req.session.cart;
    const existingIdx = cart.findIndex(
      (item) => item.product.toString() === productId && item.variant.toString() === variantId
    );

    if (existingIdx >= 0) {
      cart[existingIdx].quantity = Math.min(
        cart[existingIdx].quantity + quantity,
        variant.stock
      );
    } else {
      cart.push({ product: productId, variant: variantId, quantity });
    }

    sendSuccess(res, cart, 'Item added to guest cart. Login to save permanently.');
  }
}));

router.patch('/update', asyncHandler(async (req, res) => {
  const { productId, variantId, quantity } = req.body;

  if (req.user) {
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
  } else {
    const cart = req.session.cart || [];
    const item = cart.find(
      (i) => i.product.toString() === productId && i.variant.toString() === variantId
    );
    if (!item) throw new AppError('Item not in cart', 404);
    if (quantity < 1) {
      req.session.cart = cart.filter(
        (i) => !(i.product.toString() === productId && i.variant.toString() === variantId)
      );
    } else {
      item.quantity = quantity;
    }
    sendSuccess(res, req.session.cart, 'Guest cart updated');
  }
}));

router.delete('/remove/:productId/:variantId', protect, asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { cart: { product: productId, variant: variantId } },
  });
  sendSuccess(res, {}, 'Item removed from cart');
}));

router.delete('/clear', asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });
    sendSuccess(res, {}, 'Cart cleared');
  } else {
    req.session.cart = [];
    sendSuccess(res, {}, 'Guest cart cleared');
  }
}));

module.exports = router;
