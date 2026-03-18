const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { authLimiter, loginSlowDown } = require('../../middleware/rateLimit.middleware');
const { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema } = require('./auth.schema');

router.post('/register', authLimiter, validate(RegisterSchema), AuthController.register);
router.post('/login', authLimiter, loginSlowDown, validate(LoginSchema), AuthController.login);
router.post('/logout', protect, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', protect, AuthController.getMe);
router.post('/forgot-password', authLimiter, validate(ForgotPasswordSchema), AuthController.forgotPassword);
router.patch('/reset-password/:token', validate(ResetPasswordSchema), AuthController.resetPassword);

module.exports = router;
