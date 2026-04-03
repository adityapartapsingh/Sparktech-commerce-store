const User = require('../../models/User.model');
const Order = require('../../models/Order.model');
const asyncHandler = require('../../utils/asyncHandler');
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
