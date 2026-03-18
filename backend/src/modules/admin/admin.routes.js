const express = require('express');
const router = express.Router();
const Order = require('../../models/Order.model');
const Product = require('../../models/Product.model');
const User = require('../../models/User.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

router.get('/dashboard', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const [
    totalOrders, totalRevenue, totalUsers, totalProducts,
    recentOrders, salesByStatus, lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.find({ 'variants.stock': { $lt: 10 }, isActive: true })
      .select('name variants.stock variants.sku slug')
      .limit(10),
  ]);

  sendSuccess(res, {
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
    },
    recentOrders,
    salesByStatus,
    lowStockProducts,
  }, 'Dashboard data fetched');
}));

router.post('/create-admin', protect, authorize('masteradmin'), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  const newAdmin = await User.create({
    name, email, password, role: 'admin'
  });

  sendSuccess(res, { _id: newAdmin._id, email: newAdmin.email }, 'Admin account created successfully', 201);
}));

module.exports = router;
