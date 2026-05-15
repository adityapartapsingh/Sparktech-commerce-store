const express = require('express');
const router = express.Router();
const Order = require('../../models/Order.model');
const Product = require('../../models/Product.model');
const User = require('../../models/User.model');
const Feedback = require('../../models/Feedback.model');
const Review = require('../../models/Review.model');
const Notification = require('../../models/Notification.model');
const AppError = require('../../utils/AppError');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

router.get('/dashboard', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalOrders, totalRevenue, totalUsers, totalProducts,
    recentOrders, salesByStatus, lowStockProducts,
    todayStats, thirtyDayRevenue, topProducts, recentUsers,
    pendingFeedback, pendingReturns
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $in: ['paid', 'delivered', 'shipped'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email'),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Product.find({ 'variants.stock': { $lt: 10 }, isActive: true })
      .select('name variants.stock variants.sku slug')
      .limit(10),
    Order.aggregate([
      { $match: { createdAt: { $gte: today } } },
      { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: { $cond: [{ $in: ['$status', ['paid', 'delivered', 'shipped']] }, '$totalAmount', 0] } } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $in: ['paid', 'delivered', 'shipped'] } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { _id: 1 } }
    ]),
    Order.aggregate([
      { $match: { status: { $in: ['paid', 'delivered', 'shipped'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $unwind: '$productDetails' },
      { $project: { _id: 1, totalSold: 1, revenue: 1, name: '$productDetails.name', image: { $arrayElemAt: ['$productDetails.images', 0] } } }
    ]),
    User.find({ role: 'customer' }).sort({ createdAt: -1 }).select('name email createdAt').limit(5),
    Feedback.countDocuments({ status: 'open' }),
    Order.countDocuments({ 'returnRequest.status': 'pending' })
  ]);

  // Transform 30-day revenue to fill missing days with 0
  const trendData = [];
  for (let d = new Date(thirtyDaysAgo); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const found = thirtyDayRevenue.find(r => r._id === dateStr);
    trendData.push({ date: dateStr, revenue: found ? found.revenue : 0 });
  }

  // Combine recent activity feed
  const activityFeed = [
    ...recentOrders.map(o => ({ type: 'order', id: o._id, message: `New order by ${o.user?.name || 'Guest'}`, date: o.createdAt })),
    ...recentUsers.map(u => ({ type: 'user', id: u._id, message: `New user joined: ${u.name}`, date: u.createdAt })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

  sendSuccess(res, {
    stats: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalUsers,
      totalProducts,
      pendingFeedback,
      pendingReturns,
    },
    today: {
      orders: todayStats[0]?.orders || 0,
      revenue: todayStats[0]?.revenue || 0,
    },
    trendData,
    topProducts,
    recentOrders,
    salesByStatus,
    lowStockProducts,
    activityFeed
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
  const logPath = path.join(__dirname, '../../../logs', type);

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

// ══════════════════════════════════════════════════════════════
//  REVIEWS MANAGEMENT
// ══════════════════════════════════════════════════════════════

// List all reviews (with filters)
router.get('/reviews', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const page   = Math.max(1, Number(req.query.page) || 1);
  const limit  = Math.min(100, Number(req.query.limit) || 30);
  const skip   = (page - 1) * limit;
  const filter = {};

  if (req.query.productId) filter.product = req.query.productId;
  if (req.query.rating)    filter.rating  = Number(req.query.rating);
  if (req.query.minRating) filter.rating  = { ...filter.rating, $gte: Number(req.query.minRating) };
  if (req.query.maxRating) filter.rating  = { ...filter.rating, $lte: Number(req.query.maxRating) };

  const sort = req.query.sort === 'oldest' ? { createdAt: 1 }
             : req.query.sort === 'rating_high' ? { rating: -1, createdAt: -1 }
             : req.query.sort === 'rating_low'  ? { rating: 1,  createdAt: -1 }
             : { createdAt: -1 };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug images')
      .populate('remarkedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter)
  ]);

  // Rating distribution
  const ratingStats = await Review.aggregate([
    ...(req.query.productId ? [{ $match: { product: require('mongoose').Types.ObjectId(req.query.productId) } }] : []),
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } }
  ]);

  sendSuccess(res, {
    reviews,
    ratingStats,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }, 'Reviews fetched');
}));

// Delete a review (admin moderation)
router.delete('/reviews/:id', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError('Review not found', 404);
  await review.deleteOne();
  sendSuccess(res, {}, 'Review deleted by admin');
}));

// ══════════════════════════════════════════════════════════════
//  FEEDBACK MANAGEMENT
// ══════════════════════════════════════════════════════════════

// List all feedback across products (with filters)
router.get('/feedback', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const page   = Math.max(1, Number(req.query.page) || 1);
  const limit  = Math.min(100, Number(req.query.limit) || 30);
  const skip   = (page - 1) * limit;
  const filter = {};

  if (req.query.type   && ['complaint','suggestion','feedback','compliment'].includes(req.query.type))   filter.type   = req.query.type;
  if (req.query.status && ['open','reviewed','resolved'].includes(req.query.status)) filter.status = req.query.status;

  const [feedbacks, total] = await Promise.all([
    Feedback.find(filter)
      .populate('user', 'name email')
      .populate('product', 'name slug images')
      .populate('order', '_id totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Feedback.countDocuments(filter)
  ]);

  sendSuccess(res, {
    feedbacks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }, 'Feedback fetched');
}));

// Update feedback status & add admin reply
router.patch('/feedback/:id', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const update = {};
  
  if (status && ['open','reviewed','resolved'].includes(status)) update.status = status;
  
  // We use $set for status, but $push for replies.
  // We'll fetch the document first to do this cleanly.
  const feedback = await Feedback.findById(req.params.id);
  if (!feedback) throw new AppError('Feedback not found', 404);

  if (status && ['open','reviewed','resolved'].includes(status)) {
    feedback.status = status;
  }
  
  if (adminNote && adminNote.trim().length > 0) {
    feedback.adminNote = adminNote; // Keep for legacy
    feedback.adminRespondedAt = new Date();
    feedback.replies.push({
      sender: 'admin',
      senderName: req.user.name,
      message: adminNote
    });

    await Notification.create({
      user: feedback.user,
      title: 'Support Ticket Update',
      message: `An admin has replied to your ticket.`,
      type: 'system',
      link: '/support'
    });
  }

  await feedback.save();
  
  // Populate to return updated data
  await feedback.populate('user', 'name email');
  await feedback.populate('product', 'name slug images');

  if (!feedback) throw new AppError('Feedback not found', 404);
  sendSuccess(res, feedback, 'Feedback updated');
}));

// ══════════════════════════════════════════════════════════════
//  RETURN / REPLACEMENT REQUEST MANAGEMENT
// ══════════════════════════════════════════════════════════════

// List all orders that have a return request
router.get('/returns', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Number(req.query.limit) || 20);
  const skip  = (page - 1) * limit;

  const filter = { 'returnRequest.reason': { $exists: true, $ne: null } };
  if (req.query.status && ['pending','under_review','approved','rejected','completed'].includes(req.query.status)) {
    filter['returnRequest.status'] = req.query.status;
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ 'returnRequest.requestedAt': -1 })
      .select('_id items totalAmount status shippingAddress returnRequest createdAt user')
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter)
  ]);

  sendSuccess(res, {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  }, 'Return requests fetched');
}));

// Update return request status & admin note on an order
router.patch('/returns/:orderId', protect, authorize('admin', 'masteradmin'), asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;
  const order = await Order.findById(req.params.orderId);
  if (!order) throw new AppError('Order not found', 404);
  if (!order.returnRequest?.reason) throw new AppError('No return request exists on this order', 400);

  if (status && ['pending','under_review','approved','rejected','completed'].includes(status)) {
    order.returnRequest.status = status;
    if (['approved','rejected','completed'].includes(status)) {
      order.returnRequest.resolvedAt = new Date();
      
      await Notification.create({
        user: order.user,
        title: `Return Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your return request for order #${order._id.toString().substring(0,8).toUpperCase()} has been ${status}.`,
        type: 'system',
        link: '/orders'
      });
    }
  }
  if (adminNote !== undefined) order.returnRequest.adminNote = adminNote;

  await order.save();

  const populated = await Order.findById(order._id).populate('user', 'name email phone');
  sendSuccess(res, populated, 'Return request updated');
}));

module.exports = router;
