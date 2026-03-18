const nodemailer = require('nodemailer');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || process.env.GMAIL_USER,
    pass: process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send an HTML email.
 * @param {Object} options - { to, subject, html }
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'RoboMart <noreply@robomart.com>',
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}`);
  } catch (error) {
    logger.error(`Email sending failed: ${error.message}`);
    throw error;
  }
};

const orderConfirmationEmail = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: #0A0A0F; padding: 20px; text-align: center;">
      <h1 style="color: #00D4FF; margin: 0;">⚡ RoboMart</h1>
    </div>
    <div style="padding: 30px; background: #f9f9f9;">
      <h2>Order Confirmed! 🎉</h2>
      <p>Thank you for your order. Your order ID is: <strong>#${order._id}</strong></p>
      <p>Total: <strong>₹${order.totalAmount}</strong></p>
      <p>We'll send you another email when your order ships.</p>
    </div>
  </div>
`;

module.exports = { sendEmail, orderConfirmationEmail };
