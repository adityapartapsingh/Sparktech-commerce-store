const { z } = require('zod');

// ── Cart Schemas ────────────────────────────────────────
exports.AddToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity:  z.number().int().min(1, 'Quantity must be at least 1').max(50, 'Max 50 per item').optional().default(1),
});

exports.UpdateCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity:  z.number().int().min(0, 'Quantity must be 0 or more').max(50, 'Max 50 per item'),
});

// ── Order Schemas ───────────────────────────────────────
exports.CancelOrderSchema = z.object({
  reason:  z.string().max(200).optional(),
  comment: z.string().max(500).optional(),
});

exports.ReturnOrderSchema = z.object({
  type:                z.enum(['return', 'replacement']).optional().default('return'),
  reason:              z.string().min(1, 'Reason is required').max(200),
  description:         z.string().min(20, 'Please provide at least 20 characters describing the issue').max(2000),
  itemsAffected:       z.array(z.string()).optional().default([]),
  preferredResolution: z.string().max(200).optional().default(''),
  contactPhone:        z.string().regex(/^\d{10,15}$/, 'Invalid phone number').optional().or(z.literal('')),
  bankAccount:         z.string().max(100).optional().default(''),
});

exports.UpdateOrderStatusSchema = z.object({
  status:         z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
  trackingNumber: z.string().max(100).optional(),
});

exports.UpdateDeliverySchema = z.object({
  provider:       z.string().min(1, 'Provider is required').max(100),
  trackingUrl:    z.string().url('Invalid tracking URL').optional().or(z.literal('')),
  trackingNumber: z.string().min(1, 'Tracking number is required').max(100),
});

// ── Payment Schemas ─────────────────────────────────────
const ShippingAddressSchema = z.object({
  label:   z.string().max(50).optional().default('Home'),
  line1:   z.string().min(5, 'Street address is required').max(200),
  line2:   z.string().max(200).optional(),
  city:    z.string().min(2, 'City is required').max(100),
  state:   z.string().min(2, 'State is required').max(100),
  pincode: z.string().min(6, 'Valid pincode required').max(10),
  country: z.string().max(50).optional().default('India'),
  phone:   z.string().min(10, 'Valid phone number required').max(15),
});

const CartItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity:  z.number().int().min(1).max(50),
  name:      z.string().optional(),
});

exports.CreateOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  cartItems:       z.array(CartItemSchema).optional(),
});

exports.VerifyPaymentSchema = z.object({
  razorpay_order_id:   z.string().min(1, 'Razorpay order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Razorpay payment ID is required'),
  razorpay_signature:  z.string().min(1, 'Razorpay signature is required'),
  dbOrderId:           z.string().min(1, 'DB order ID is required'),
});

exports.CODOrderSchema = z.object({
  shippingAddress: ShippingAddressSchema,
  cartItems:       z.array(CartItemSchema).optional(),
});

// ── Review Schemas ──────────────────────────────────────
exports.CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating:    z.number().int().min(1, 'Rating must be 1-5').max(5),
  title:     z.string().min(2, 'Title is required').max(150).optional(),
  comment:   z.string().min(10, 'Comment must be at least 10 characters').max(2000),
});

// ── Category Schemas ────────────────────────────────────
exports.CreateCategorySchema = z.object({
  name:      z.string().min(2, 'Name must be at least 2 characters').max(100),
  slug:      z.string().max(100).optional(),
  parent:    z.string().optional(),
  isActive:  z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

exports.UpdateCategorySchema = z.object({
  name:      z.string().min(2).max(100).optional(),
  slug:      z.string().max(100).optional(),
  parent:    z.string().nullable().optional(),
  isActive:  z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

// ── Feedback Schema ─────────────────────────────────────
exports.FeedbackSchema = z.object({
  type:    z.enum(['complaint', 'suggestion', 'feedback', 'compliment']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  rating:  z.number().int().min(1).max(5).optional(),
  orderId: z.string().optional(),
});
