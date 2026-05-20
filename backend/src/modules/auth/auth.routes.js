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

const getCallbackURL = (req, provider) => {
  if (process.env.BACKEND_URL) {
    return `${process.env.BACKEND_URL.replace(/\/+$/, '')}/api/v1/auth/${provider}/callback`;
  }
  const host = req.get('host');
  const proto = req.secure || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${proto}://${host}/api/v1/auth/${provider}/callback`;
};

// Federations
router.get('/google', (req, res, next) => {
  const callbackURL = getCallbackURL(req, 'google');
  passport.authenticate('google', { scope: ['profile', 'email'], callbackURL })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  const callbackURL = getCallbackURL(req, 'google');
  passport.authenticate('google', { 
    session: false, 
    failureRedirect: frontendLoginUrl,
    callbackURL
  })(req, res, next);
}, AuthController.oauthCallback);

router.get('/github', (req, res, next) => {
  const callbackURL = getCallbackURL(req, 'github');
  passport.authenticate('github', { scope: ['user:email'], callbackURL })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  const callbackURL = getCallbackURL(req, 'github');
  passport.authenticate('github', { 
    session: false, 
    failureRedirect: frontendLoginUrl,
    callbackURL
  })(req, res, next);
}, AuthController.oauthCallback);

router.post('/logout', protect, AuthController.logout);
router.post('/refresh', AuthController.refresh);
router.get('/me', protect, AuthController.getMe);
router.post('/forgot-password', authLimiter, validate(ForgotPasswordSchema), AuthController.forgotPassword);
router.patch('/reset-password/:token', validate(ResetPasswordSchema), AuthController.resetPassword);

module.exports = router;
