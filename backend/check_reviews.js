require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./src/models/Review.model');
require('./src/models/User.model');

async function checkReviews() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const reviews = await Review.find().populate('user', 'email').lean();
    console.log(JSON.stringify(reviews, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkReviews();
