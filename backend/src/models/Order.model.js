const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant:      { type: mongoose.Schema.Types.ObjectId, required: true },
  name:         String,          // snapshot at purchase time
  variantLabel: String,
  image:        String,
  sku:          String,
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
  paymentInfo: {
    method:  { type: String, enum: ['razorpay', 'cod', 'wallet', 'other'], default: 'razorpay' },
    status:  { type: String, enum: ['unpaid', 'paid', 'failed'],           default: 'unpaid'    },
  },
  trackingNumber:      String,
  notes:               String,
  cancellationReason:  String,   // why customer cancelled
  cancelledAt:         Date,
  deliveryInfo: {
    fee:               { type: Number, default: 0 },
    estimatedDelivery: Date,
    dispatchedAt:      Date,
    provider:          String,
    trackingUrl:       String,
  },
  returnRequest: {
    type:               { type: String, enum: ['return', 'replacement'] },
    reason:             String,   // primary reason category
    description:        String,   // detailed description of issue
    itemsAffected:      [String], // names of items in the order that are affected
    preferredResolution:String,   // e.g. 'Full refund', 'Partial refund', 'Store credit'
    contactPhone:       String,
    bankAccount:        String,   // last-4 or UPI id for refund
    status:             { type: String, enum: ['pending', 'under_review', 'approved', 'rejected', 'completed'], default: 'pending' },
    adminNote:          String,
    requestedAt:        Date,
    resolvedAt:         Date,
  },
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
