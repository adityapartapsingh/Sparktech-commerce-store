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
  title:   { type: String, maxlength: 100 },
  comment: { type: String, maxlength: 2000 },
  verified: { type: Boolean, default: false }, // true if user ordered this product
}, { timestamps: true });

// One review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

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
