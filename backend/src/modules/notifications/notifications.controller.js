const Notification = require('../../models/Notification.model');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/apiResponse');

exports.getNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);
  const skip = (page - 1) * limit;

  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ user: req.user._id, read: false })
  ]);

  sendSuccess(res, { notifications, unreadCount }, 'Notifications fetched');
});

exports.markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) throw new AppError('Notification not found', 404);

  sendSuccess(res, notification, 'Notification marked as read');
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true }
  );

  sendSuccess(res, null, 'All notifications marked as read');
});

exports.deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) throw new AppError('Notification not found', 404);

  sendSuccess(res, null, 'Notification deleted');
});
