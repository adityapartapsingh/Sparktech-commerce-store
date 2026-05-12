const express = require('express');
const router = express.Router();
const User = require('../../models/User.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const AppError = require('../../utils/AppError');
const { protect } = require('../../middleware/auth.middleware');

// Get user's wishlist
router.get('/', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({ path: 'wishlist', select: 'name slug images basePrice variants ratings isFeatured brand' });
  sendSuccess(res, user?.wishlist || [], 'Wishlist fetched');
}));

// Add to wishlist (toggle)
router.post('/toggle/:productId', protect, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  const idx = user.wishlist.indexOf(productId);
  let action;

  if (idx >= 0) {
    user.wishlist.splice(idx, 1);
    action = 'removed';
  } else {
    user.wishlist.push(productId);
    action = 'added';
  }

  await user.save();
  sendSuccess(res, { wishlist: user.wishlist, action }, `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`);
}));

// Clear entire wishlist
router.delete('/clear', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { wishlist: [] } });
  sendSuccess(res, {}, 'Wishlist cleared');
}));

module.exports = router;
