const express = require('express');
const router = express.Router();
const Order = require('../../models/Order.model');
const Product = require('../../models/Product.model');
const User = require('../../models/User.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

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

router.get('/logs', protect, authorize('masteradmin'), asyncHandler(async (req, res) => {
  const type = req.query.type === 'error' ? 'error.log' : 'combined.log';
  const limit = parseInt(req.query.limit, 10) || 200;
  
  // Navigate from backend/src/modules/admin to backend/logs
  const logPath = path.join(__dirname, '../../../../logs', type);

  if (!fs.existsSync(logPath)) {
    return sendSuccess(res, [], 'No logs recorded yet');
  }

  const logs = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(logPath),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.trim()) {
      try {
        logs.push(JSON.parse(line));
      } catch (err) {
        logs.push({ level: 'unknown', message: line, timestamp: new Date().toISOString() });
      }
    }
  }

  // Return the most recent N logs (reverse chronological order)
  const recentLogs = logs.slice(-limit).reverse();
  
  sendSuccess(res, recentLogs, 'System logs streamed successfully');
}));

module.exports = router;
