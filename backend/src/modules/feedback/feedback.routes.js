const express = require('express');
const router = express.Router();
const Feedback = require('../../models/Feedback.model');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/apiResponse');
const { protect } = require('../../middleware/auth.middleware');
const AppError = require('../../utils/AppError');

// User: submit feedback (general or product-specific)
router.post('/', protect, asyncHandler(async (req, res) => {
  const { type, subject, message, rating, productId, orderId } = req.body;
  if (!message || message.length < 10) throw new AppError('Message must be at least 10 characters', 400);
  if (!['complaint', 'suggestion', 'feedback', 'compliment'].includes(type)) {
    throw new AppError('Invalid feedback type', 400);
  }

  const feedback = await Feedback.create({
    user:    req.user._id,
    product: productId || undefined,
    order:   orderId || undefined,
    type,
    subject: subject || undefined,
    message,
    rating:  rating ? Number(rating) : undefined,
    ticketId: `TKT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  });
  sendSuccess(res, { id: feedback._id }, 'Your message has been submitted. We will get back to you soon.', 201);
}));

// Guest: submit inquiry / quotation request
router.post('/guest', asyncHandler(async (req, res) => {
  const { name, email, phone, type = 'feedback', subject, message } = req.body;
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new AppError('Please provide a valid email address', 400);
  if (!name || name.trim().length < 2) throw new AppError('Please provide your name', 400);
  if (!message || message.trim().length < 10) throw new AppError('Message must be at least 10 characters', 400);

  const feedback = await Feedback.create({
    guestInfo: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : undefined,
    },
    type: ['complaint', 'suggestion', 'feedback', 'compliment'].includes(type) ? type : 'feedback',
    subject: subject ? subject.trim() : 'General Guest Inquiry',
    message: message.trim(),
    ticketId: `GST-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  });

  sendSuccess(res, { id: feedback._id, ticketId: feedback.ticketId }, 'Your inquiry has been received. Our team will contact you shortly.', 201);
}));

// User: view their OWN feedback history (confidential — only their submissions)
router.get('/mine', protect, asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find({ user: req.user._id })
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 });
  sendSuccess(res, feedbacks, 'Your feedback history');
}));

// User: reply to their own ticket
router.post('/:id/reply', protect, asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message || message.length < 2) throw new AppError('Message must be at least 2 characters', 400);

  const feedback = await Feedback.findOne({ _id: req.params.id, user: req.user._id });
  if (!feedback) throw new AppError('Ticket not found', 404);

  feedback.replies.push({
    sender: 'user',
    senderName: req.user.name,
    message,
  });
  
  // Update status if it was reviewed/resolved to notify admin? Optional.
  // feedback.status = 'open'; // Re-open ticket when user replies

  await feedback.save();
  sendSuccess(res, feedback, 'Reply added successfully');
}));

module.exports = router;
