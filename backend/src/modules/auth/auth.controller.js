const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/apiResponse');
const AuthService = require('./auth.service');

exports.register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body, res);
  // Returns HTTP 202 Accepted because the creation is pending verification
  sendSuccess(res, result, 'Verification required', 202);
});

exports.verifyOtp = asyncHandler(async (req, res) => {
  const user = await AuthService.verifyOtp(req.body, res);
  sendSuccess(res, user, 'Account verified and logged in successfully', 200);
});

exports.login = asyncHandler(async (req, res) => {
  const user = await AuthService.login(req.body, res);
  sendSuccess(res, user, 'Login successful');
});

exports.oauthCallback = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError('OAuth authentication failed', 401);
  await AuthService.oauthLogin(req.user, res);
  // Redirect to frontend — use FRONTEND_URL (CRA runs on 3000, Vite on 5173)
  const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000';
  res.redirect(frontendUrl);
});

exports.logout = asyncHandler(async (req, res) => {
  await AuthService.logout(req.user._id, res);
  sendSuccess(res, {}, 'Logged out successfully');
});

exports.refresh = asyncHandler(async (req, res) => {
  const data = await AuthService.refresh(req, res);
  sendSuccess(res, data, 'Tokens refreshed');
});

exports.getMe = asyncHandler(async (req, res) => {
  sendSuccess(res, req.user, 'User profile fetched');
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  await AuthService.forgotPassword(req.body.email);
  sendSuccess(res, {}, 'If this email exists, a reset link has been sent.');
});

exports.resetPassword = asyncHandler(async (req, res) => {
  await AuthService.resetPassword(req.params.token, req.body.password);
  sendSuccess(res, {}, 'Password reset successful. Please log in.');
});
