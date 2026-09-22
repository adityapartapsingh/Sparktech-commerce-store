const crypto = require('crypto');
const logger = require('./logger');


// Generate a cryptographically secure 6-digit OTP
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};


exports.sendEmailOTP = async (email, otp) => {
  try {
    logger.info(`[EMAIL SERVICE] -> Sent OTP [${otp}] to Address: ${email}`);
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    logger.error('Email OTP dispatcher failed', { error: error.message });
    throw new Error('Failed to dispatch email verification');
  }
};


exports.sendPhoneOTP = async (phone, otp) => {
  try {
    logger.info(`[SMS SERVICE] -> Sent OTP [${otp}] to Phone: ${phone}`);
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    logger.error('SMS OTP dispatcher failed', { error: error.message });
    throw new Error('Failed to dispatch SMS verification');
  }
};
