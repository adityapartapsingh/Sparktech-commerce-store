const mongoose = require('mongoose');

// Reusable sub-schemas
const AttributeSchema = new mongoose.Schema({
  key:   { type: String, required: true },  // e.g. "Voltage"
  value: { type: String, required: true },  // e.g. "12"
  unit:  { type: String },                  // e.g. "V"
}, { _id: false });

const VariantSchema = new mongoose.Schema({
  sku:        { type: String, required: true },
  label:      { type: String, required: true }, // e.g. "12V / 2A"
  price:      { type: Number, required: true, min: 0 },
  stock:      { type: Number, default: 0, min: 0 },
  attributes: [AttributeSchema],
  images:     [String],  // Cloudinary URLs for variant-specific images
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: 200,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description:     { type: String, maxlength: 5000 },
  shortDescription: { type: String, maxlength: 300 },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true,
  },
  subCategory: { type: String, trim: true },
  brand:    { type: String, index: true },
  tags:     [String],
  shortWarranty: { type: String, maxlength: 100 },
  warranty: { type: String, maxlength: 1000 },
  images:   [String],          // Primary product images (Cloudinary URLs)
  datasheet: String,           // Cloudinary PDF URL
  attributes: [AttributeSchema], // Common specs for all variants
  variants:   [VariantSchema],
  basePrice: {                 // Lowest variant price — used for range filtering
    type: Number,
    default: 0,
  },
  ratings: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0 },
  },
  isFeatured:  { type: Boolean, default: false, index: true },
  isActive:    { type: Boolean, default: true, index: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Indexes for filtering and search
ProductSchema.index({ category: 1, basePrice: 1 });
ProductSchema.index({ 'attributes.key': 1, 'attributes.value': 1 });
ProductSchema.index({ name: 'text', sku: 'text', 'variants.sku': 'text', tags: 'text', description: 'text' });
ProductSchema.index({ 'variants.sku': 1 });
ProductSchema.index({ createdAt: -1 });

// Strict Database-Level Validation: Ensure variant SKUs are strictly unique globally
ProductSchema.pre('validate', async function () {
  if (this.variants && this.variants.length > 0) {
    const skus = this.variants.map((v) => v.sku);
    // 1. Check for duplicates within its own variants
    if (new Set(skus).size !== skus.length) {
      throw new Error('Duplicate SKUs found within this product\'s variants.');
    }
    
    // 2. Check for collisions against all other existing products in the DB
    const existingProduct = await mongoose.models.Product.findOne({
      _id: { $ne: this._id || null },
      'variants.sku': { $in: skus }
    });
    
    if (existingProduct) {
      throw new Error(`Validation Failed: One or more variant SKUs already belong to an existing product (ID: ${existingProduct._id})`);
    }
  }
});

// Auto-set basePrice from variants before save
ProductSchema.pre('save', function () {
  if (this.variants && this.variants.length > 0) {
    this.basePrice = Math.min(...this.variants.map((v) => v.price));
  }
});

module.exports = mongoose.model('Product', ProductSchema);
