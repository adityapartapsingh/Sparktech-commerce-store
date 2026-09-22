const Product = require('../../models/Product.model');

exports.findMany = (filter, options) =>
  Product.find(filter, null, options).populate('category', 'name slug');

exports.countDocuments = (filter) => Product.countDocuments(filter);
exports.findOne = (filter) => Product.findOne(filter).populate('category', 'name slug');
exports.findByIdOrSlug = (id) => {
  if (!id || typeof id !== 'string') return null;
  const isObjectId = /^[a-f\d]{24}$/i.test(id);
  return Product.findOne({ $or: [{ slug: id }, ...(isObjectId ? [{ _id: id }] : [])] })
    .populate('category', 'name slug');
};
exports.create = (data) => Product.create(data);
exports.findByIdAndUpdate = (id, data) => Product.findByIdAndUpdate(id, data, { returnDocument: 'after', runValidators: true });
exports.findByIdAndDelete = (id) => Product.findByIdAndDelete(id);
exports.findFeatured = () => Product.find({ isFeatured: true, isActive: true }).limit(8);
