const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../../utils/AppError');
const { sendEmail } = require('../../utils/sendEmail');
const AuthRepo = require('./auth.repository');
const { generateOTP, sendEmailOTP, sendPhoneOTP } = require('../../utils/otp.service');
const User = require('../../models/User.model');

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
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
};

exports.register = async (data, res) => {
  const existingEmail = await AuthRepo.findByEmail(data.email);
  if (existingEmail) throw new AppError('Email already in use', 409);

  // Only check phone uniqueness if a phone was provided
  if (data.phone && data.phone.trim() !== '') {
    const existingPhone = await AuthRepo.findByPhone(data.phone);
    if (existingPhone) throw new AppError('Phone number already in use', 409);
  }

  // Generate codes
  const emailOtp = generateOTP();
  const phoneOtp = data.phone ? generateOTP() : null;
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const userData = {
    name:    data.name,
    email:   data.email,
    password: data.password,
    ...(data.phone && data.phone.trim() !== '' && { phone: data.phone }),
    emailOtp,
    ...(phoneOtp && { phoneOtp }),
    emailOtpExpires: otpExpires,
    ...(phoneOtp && { phoneOtpExpires: otpExpires }),
    isEmailVerified: false,
    isPhoneVerified: !phoneOtp, // auto-verify if no phone was provided
    authProvider: 'local'
  };

  const user = await AuthRepo.create(userData);

  // Dispatch OTPs — always send email, only phone if number was given
  const otpPromises = [sendEmailOTP(user.email, emailOtp)];
  if (phoneOtp && data.phone) otpPromises.push(sendPhoneOTP(data.phone, phoneOtp));
  await Promise.all(otpPromises);

  const message = phoneOtp
    ? 'OTP codes dispatched to your email and phone. Check your backend terminal (mocked).'
    : 'Verification code dispatched to your email. Check your backend terminal (mocked).';

  return { message, userId: user._id };
};

exports.verifyOtp = async ({ userId, emailOtp, phoneOtp }, res) => {
  const user = await AuthRepo.findById(userId).select('+emailOtp +phoneOtp +emailOtpExpires +phoneOtpExpires');
  if (!user) throw new AppError('User not found', 404);

  // Check expiry — only check phone expiry if phone OTP was generated
  if (Date.now() > user.emailOtpExpires) {
    throw new AppError('Email OTP has expired. Please register again.', 400);
  }
  if (user.phoneOtpExpires && Date.now() > user.phoneOtpExpires) {
    throw new AppError('Phone OTP has expired. Please register again.', 400);
  }

  if (user.emailOtp !== emailOtp) throw new AppError('Invalid Email OTP', 400);

  // Only verify phone OTP if the user has one (phone was provided during registration)
  if (user.phoneOtp) {
    if (!phoneOtp) throw new AppError('Phone OTP is required', 400);
    if (user.phoneOtp !== phoneOtp) throw new AppError('Invalid Phone OTP', 400);
  }

  // Mark verified
  user.isEmailVerified = true;
  user.isPhoneVerified = true;
  user.emailOtp = undefined;
  user.phoneOtp = undefined;
  user.emailOtpExpires = undefined;
  user.phoneOtpExpires = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  await AuthRepo.updateRefreshToken(user._id, refreshToken);

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role };
};

exports.login = async ({ identifier, password }, res, req) => {
  const user = await AuthRepo.findByIdentifier(identifier);
  if (!user || user.authProvider !== 'local' || !(await user.comparePassword(password))) {
    throw new AppError('Invalid credentials or account belongs to an OAuth provider', 401);
  }

  if (!user.isEmailVerified || !user.isPhoneVerified) {
    throw new AppError('Account is not verified. Please complete your registration via OTP.', 403);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  await AuthRepo.updateRefreshToken(user._id, refreshToken);

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

  return { _id: user._id, name: user.name, email: user.email, role: user.role };
};

exports.oauthLogin = async (user, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id);
  await AuthRepo.updateRefreshToken(user._id, refreshToken);

  res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
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

  const resetUrl = `${process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'SparkTech — Password Reset',
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
