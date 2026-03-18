const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant:      { type: mongoose.Schema.Types.ObjectId, required: true },
  name:         String,          // snapshot at purchase time
  variantLabel: String,
  image:        String,
  price:        { type: Number, required: true },
  quantity:     { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items:       [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index: true,
  },
  shippingAddress: {
    label:   { type: String, default: 'Home' },
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    pincode: String,
    country: { type: String, default: 'India' },
    phone:   String,
  },
  // Razorpay payment details
  razorpayOrderId:   { type: String, sparse: true },
  razorpayPaymentId: { type: String, sparse: true },
  trackingNumber: String,
  notes:          String,
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ razorpayOrderId: 1 });
OrderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', OrderSchema);
