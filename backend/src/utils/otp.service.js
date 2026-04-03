const crypto = require('crypto');
const logger = require('./logger');

/**
 * Generate a cryptographically secure 6-digit OTP
 */
exports.generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send an OTP natively via Email
 * Currently mocked for development to prevent blocking infrastructure.
 * In a real production environment, integrate Nodemailer / SendGrid here.
 */
exports.sendEmailOTP = async (email, otp) => {
  try {
    // TODO: Plug Nodemailer Transport here securely
    logger.info(`[MOCK EMAIL SERVICE] -> Sent OTP [${otp}] to Address: ${email}`);
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    logger.error('Email OTP dispatcher failed', { error: error.message });
    throw new Error('Failed to dispatch email verification');
  }
};

/**
 * Send an OTP natively via SMS
 * Currently mocked for development (no Twilio keys explicitly provided).
 * In a real production environment, use twilio client.messages.create()
 */
exports.sendPhoneOTP = async (phone, otp) => {
  try {
    // TODO: Plug Twilio Client here securely
    logger.info(`[MOCK SMS SERVICE] -> Sent OTP [${otp}] to Cellular Device: ${phone}`);
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return true;
  } catch (error) {
    logger.error('SMS OTP dispatcher failed', { error: error.message });
    throw new Error('Failed to dispatch SMS verification');
  }
};
