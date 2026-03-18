const { z } = require('zod');

exports.RegisterSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters').max(100),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  passwordConfirm: z.string().min(8, 'Confirm password must be at least 8 characters long'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

exports.LoginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

exports.ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

exports.ResetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
