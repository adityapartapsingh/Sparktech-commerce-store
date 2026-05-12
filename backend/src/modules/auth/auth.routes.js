const express = require('express');
const passport = require('passport');
const router = express.Router();
const AuthController = require('./auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { authLimiter, loginSlowDown } = require('../../middleware/rateLimit.middleware');
const { RegisterSchema, LoginSchema, VerifySchema, ForgotPasswordSchema, ResetPasswordSchema } = require('./auth.schema');

router.post('/register', authLimiter, validate(RegisterSchema), AuthController.register);
router.post('/verify-otp', authLimiter, validate(VerifySchema), AuthController.verifyOtp);
router.post('/login', authLimiter, loginSlowDown, validate(LoginSchema), AuthController.login);

const frontendLoginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`;

// Federations
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: frontendLoginUrl }), AuthController.oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: frontendLoginUrl }), AuthController.oauthCallback);

router.post('/logout', protect, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', protect, AuthController.getMe);
router.post('/forgot-password', authLimiter, validate(ForgotPasswordSchema), AuthController.forgotPassword);
router.patch('/reset-password/:token', validate(ResetPasswordSchema), AuthController.resetPassword);

module.exports = router;
