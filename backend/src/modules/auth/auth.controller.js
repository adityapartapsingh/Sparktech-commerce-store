const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const AuthService = require('./auth.service');

exports.register = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body, res);
  sendSuccess(res, user, 'Registration successful', 201);
});

exports.login = asyncHandler(async (req, res) => {
  const user = await AuthService.login(req.body, res);
  sendSuccess(res, user, 'Login successful');
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
