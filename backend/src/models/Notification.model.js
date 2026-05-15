const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['order', 'system', 'promo', 'review'],
    default: 'system',
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
}, { timestamps: true });

// Index for efficient querying by user
NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
