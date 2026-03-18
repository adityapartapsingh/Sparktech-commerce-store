const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../../utils/AppError');
const { sendEmail } = require('../../utils/sendEmail');
const AuthRepo = require('./auth.repository');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
  return { accessToken, refreshToken };
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

exports.register = async (data, res) => {
  const existing = await AuthRepo.findByEmail(data.email);
  if (existing) throw new AppError('Email already in use', 409);

  const user = await AuthRepo.create(data);
  const { accessToken, refreshToken } = generateTokens(user._id);
  await AuthRepo.updateRefreshToken(user._id, refreshToken);

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { _id: user._id, name: user.name, email: user.email, role: user.role };
};

exports.login = async ({ email, password }, res) => {
  const user = await AuthRepo.findByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await AuthRepo.updateRefreshToken(user._id, refreshToken);

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { _id: user._id, name: user.name, email: user.email, role: user.role };
};

exports.refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError('No refresh token', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await AuthRepo.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token reuse detected. Please log in again.', 401);
  }

  const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
  await AuthRepo.updateRefreshToken(user._id, newRefresh);

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', newRefresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { message: 'Tokens refreshed' };
};

exports.logout = async (userId, res) => {
  await AuthRepo.clearRefreshToken(userId);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
};

exports.forgotPassword = async (email) => {
  const user = await AuthRepo.findByEmail(email);
  if (!user) return; // Silent fail — don't reveal email existence

  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'RoboMart — Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 30 minutes.</p>`,
  });
};

exports.resetPassword = async (token, newPassword) => {
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  const user = await AuthRepo.findByResetToken(hashed);
  if (!user) throw new AppError('Invalid or expired reset token', 400);

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
};
