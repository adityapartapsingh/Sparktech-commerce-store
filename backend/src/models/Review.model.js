const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  title:   { type: String, required: [true, 'Title is required'], maxlength: 100 },
  comment: { type: String, required: [true, 'Review comment is required'], maxlength: 2000 },
  verified: { type: Boolean, default: false }, // true if user ordered this product
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  adminRemarks: { type: String, maxlength: 1000 },
  remarkedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarkedAt:   { type: Date },
}, { timestamps: true });

// One review per order per product
ReviewSchema.index({ order: 1, product: 1 }, { unique: true });

// Recalculate product rating after review save/delete
ReviewSchema.statics.calcAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, numRatings: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].numRatings,
    });
  } else {
    await mongoose.model('Product').findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0,
    });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.product);
});

ReviewSchema.post('deleteOne', { document: true }, function () {
  this.constructor.calcAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);
