const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', index: true }, // optional — general feedback doesn't need a product
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  type:    { type: String, enum: ['complaint', 'suggestion', 'feedback', 'compliment'], required: true },
  subject: { type: String, maxlength: 200 },
  message: { type: String, required: true, minlength: 10 },
  rating:  { type: Number, min: 1, max: 5 },
  status:  { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
  adminNote: String,
  adminRespondedAt: Date,
  ticketId: { type: String, unique: true, index: true },
  replies: [{
    sender: { type: String, enum: ['user', 'admin'], required: true },
    senderName: String,
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
