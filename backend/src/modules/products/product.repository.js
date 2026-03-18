const Product = require('../../models/Product.model');

exports.findMany = (filter, options) =>
  Product.find(filter, null, options).populate('category', 'name slug');

exports.countDocuments = (filter) => Product.countDocuments(filter);
exports.findOne = (filter) => Product.findOne(filter).populate('category', 'name slug');
exports.findByIdOrSlug = (id) =>
  Product.findOne({ $or: [{ slug: id }, { _id: id.match(/^[a-f\d]{24}$/i) ? id : null }] })
    .populate('category', 'name slug');
exports.create = (data) => Product.create(data);
exports.findByIdAndUpdate = (id, data) => Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
exports.findByIdAndDelete = (id) => Product.findByIdAndDelete(id);
exports.findFeatured = () => Product.find({ isFeatured: true, isActive: true }).limit(8);
