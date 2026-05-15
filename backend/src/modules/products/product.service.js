const ProductRepo = require('./product.repository');
const { getRedis } = require('../../config/redis');
const AppError = require('../../utils/AppError');

const CACHE_TTL = 300; // 5 minutes

const buildFilter = (query) => {
  const filter = {};
  if (query.status === 'all') {
    // Don't filter by isActive
  } else if (query.status === 'inactive') {
    filter.isActive = false;
  } else {
    filter.isActive = true;
  }
  if (query.category) filter.category = query.category;
  if (query.brand) filter.brand = new RegExp(query.brand, 'i');
  if (query.minPrice || query.maxPrice) {
    filter.basePrice = {};
    if (query.minPrice) filter.basePrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.basePrice.$lte = Number(query.maxPrice);
  }
  if (query.search) {
    const searchRegex = new RegExp(query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { sku: searchRegex },
      { 'variants.sku': searchRegex },
      { tags: { $in: [searchRegex] } }
    ];
  }
  if (query.featured === 'true') filter.isFeatured = true;
  // Attribute filters: ?attr[Voltage]=12V
  if (query.attr) {
    const attrFilters = Object.entries(query.attr).map(([key, value]) => ({
      attributes: { $elemMatch: { key, value } },
    }));
    if (attrFilters.length) filter.$and = [...(filter.$and || []), ...attrFilters];
  }
  return filter;
};

exports.getProducts = async (query) => {
  const redis = getRedis();
  const cacheKey = `products:list:${JSON.stringify(query)}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  if (query.category) {
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(query.category)) {
      const Category = require('../../models/Category.model');
      const category = await Category.findOne({ slug: query.category });
      if (category) {
        query.category = category._id.toString();
      } else {
        return {
          products: [],
          pagination: { page: 1, limit: Number(query.limit) || 12, total: 0, totalPages: 0 }
        };
      }
    }
  }

  const filter = buildFilter(query);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Number(query.limit) || 12);
  const skip = (page - 1) * limit;

  const sortMap = {
    'price-asc': { basePrice: 1 },
    'price-desc': { basePrice: -1 },
    'newest': { createdAt: -1 },
    'rating': { 'ratings.average': -1 },
  };
  const sort = sortMap[query.sort] || { createdAt: -1 };

  const [products, total] = await Promise.all([
    ProductRepo.findMany(filter, { sort, skip, limit }),
    ProductRepo.countDocuments(filter),
  ]);

  const result = {
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };

  if (redis) await redis.set(cacheKey, JSON.stringify(result), 'EX', CACHE_TTL);
  return result;
};

exports.getProduct = async (slug) => {
  const redis = getRedis();
  const cacheKey = `products:single:${slug}`;

  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  // Accept both slug (e.g. "arduino-uno") and MongoDB ObjectId
  const product = await ProductRepo.findByIdOrSlug(slug);
  if (!product) throw new AppError('Product not found', 404);

  if (redis) await redis.set(cacheKey, JSON.stringify(product), 'EX', CACHE_TTL * 2);
  return product;
};

exports.createProduct = async (data) => {
  const redis = getRedis();
  const product = await ProductRepo.create(data);
  if (redis) await redis.keys('products:list:*').then((keys) => keys.length && redis.del(...keys));
  return product;
};

exports.updateProduct = async (id, data) => {
  const redis = getRedis();
  const product = await ProductRepo.findByIdAndUpdate(id, data);
  if (!product) throw new AppError('Product not found', 404);
  if (redis) {
    const keys = await redis.keys(`products:*`);
    if (keys.length) await redis.del(...keys);
  }
  return product;
};

exports.deleteProduct = async (id) => {
  const redis = getRedis();
  const product = await ProductRepo.findByIdAndDelete(id);
  if (!product) throw new AppError('Product not found', 404);
  if (redis) {
    const keys = await redis.keys(`products:*`);
    if (keys.length) await redis.del(...keys);
  }
};

exports.getFeaturedProducts = async () => {
  const redis = getRedis();
  const cacheKey = 'products:featured';
  if (redis) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }
  const products = await ProductRepo.findFeatured();
  if (redis) await redis.set(cacheKey, JSON.stringify(products), 'EX', 600);
  return products;
};
