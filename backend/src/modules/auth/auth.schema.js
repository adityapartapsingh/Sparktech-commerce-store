const { z } = require('zod');

exports.RegisterSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Invalid email address'),
  // phone is optional — users can register without a phone number
  phone:    z.string().regex(/^\d{10,15}$/, 'Invalid phone number (10-15 digits)').optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Frontend sends 'confirm', not 'passwordConfirm'
  confirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm, {
  message: 'Passwords do not match',
  path: ['confirm'],
});

exports.LoginSchema = z.object({
  identifier: z.string().min(3, 'Identifier is required'),
  password:   z.string().min(1, 'Password is required'),
});

exports.VerifySchema = z.object({
  userId:   z.string().min(1, 'User ID missing'),
  emailOtp: z.string().length(6, 'Email OTP must be exactly 6 digits'),
  phoneOtp: z.string().length(6, 'Phone OTP must be exactly 6 digits').optional(),
});

exports.ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

exports.ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
