const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  type:    { type: String, enum: ['complaint', 'suggestion', 'feedback', 'compliment'], required: true },
  message: { type: String, required: true, minlength: 10 },
  rating:  { type: Number, min: 1, max: 5 },
  status:  { type: String, enum: ['open', 'reviewed', 'resolved'], default: 'open' },
  adminNote: String,
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
