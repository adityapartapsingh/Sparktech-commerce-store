const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');
const validate = require('../../middleware/validate.middleware');
const { z } = require('zod');

// ── Schemas ─────────────────────────────────────────────
const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().regex(/^\d{10,15}$/, 'Invalid phone number').optional().or(z.literal('')),
});

const AddressSchema = z.object({
  label: z.string().min(1).max(50).default('Home'),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  pincode: z.string().min(4).max(10),
  country: z.string().max(100).default('India'),
  phone: z.string().regex(/^\d{10,15}$/).optional().or(z.literal('')),
});

// ── Admin-only: all customers ───────────────────────────
router.get('/', protect, authorize('admin', 'masteradmin'), UserController.getAllCustomers);

// ── Authenticated user: profile update ──────────────────
router.patch('/me', protect, validate(UpdateProfileSchema), UserController.updateProfile);

// ── Authenticated user: address CRUD ────────────────────
router.post('/me/addresses', protect, validate(AddressSchema), UserController.addAddress);
router.put('/me/addresses/:addressId', protect, validate(AddressSchema), UserController.updateAddress);
router.delete('/me/addresses/:addressId', protect, UserController.deleteAddress);

module.exports = router;
