const User = require('../../models/User.model');
const Order = require('../../models/Order.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/apiResponse');

exports.getAllCustomers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip = (page - 1) * limit;

  // Find users who are strictly customers (not admins)
  const filter = { role: 'customer' };

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  // Optionally fetch order counts for these customers
  // (In a heavily scaled app, this would be an aggregation pipeline, doing it via Promise.all for simplicity)
  const customerIds = customers.map(c => c._id);
  const orderCounts = await Order.aggregate([
    { $match: { user: { $in: customerIds } } },
    { $group: { _id: '$user', totalOrders: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } }
  ]);

  const orderMap = orderCounts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  const customersWithStats = customers.map(c => {
    const stats = orderMap[c._id.toString()] || { totalOrders: 0, totalSpent: 0 };
    return { ...c.toObject(), stats };
  });

  sendSuccess(res, {
    customers: customersWithStats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }, 'Customers fetched');
});

// ── Update Profile (name, phone) ────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const updates = {};

  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone || undefined; // empty string → remove

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  ).select('-password -refreshToken -emailOtp -emailOtpExpires -phoneOtp -phoneOtpExpires -providerId');

  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, user, 'Profile updated');
});

// ── Update Password ───────────────────────────────────────
exports.updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Need to get user with password to check
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('User not found', 404);

  // Check if current password is correct
  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) {
    throw new AppError('Incorrect current password', 401);
  }

  // Set new password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save();

  sendSuccess(res, null, 'Password updated successfully');
});

// ── Add Address ─────────────────────────────────────────
exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -emailOtp -emailOtpExpires -phoneOtp -phoneOtpExpires -providerId');

  if (!user) throw new AppError('User not found', 404);
  if (user.addresses.length >= 10) {
    throw new AppError('Maximum 10 addresses allowed', 400);
  }

  user.addresses.push(req.body);
  await user.save();

  sendSuccess(res, user, 'Address added', 201);
});

// ── Update Address ──────────────────────────────────────
exports.updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -emailOtp -emailOtpExpires -phoneOtp -phoneOtpExpires -providerId');

  if (!user) throw new AppError('User not found', 404);

  const addr = user.addresses.id(req.params.addressId);
  if (!addr) throw new AppError('Address not found', 404);

  Object.assign(addr, req.body);
  await user.save();

  sendSuccess(res, user, 'Address updated');
});

// ── Delete Address ──────────────────────────────────────
exports.deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.params.addressId } } },
    { returnDocument: 'after' }
  ).select('-password -refreshToken -emailOtp -emailOtpExpires -phoneOtp -phoneOtpExpires -providerId');

  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, user, 'Address deleted');
});

