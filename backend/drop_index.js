require('dotenv').config();
const mongoose = require('mongoose');

async function dropOldIndex() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collection = db.collection('reviews');
    
    // Check existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop the old index if it exists
    try {
      await collection.dropIndex('product_1_user_1');
      console.log('Successfully dropped old product_1_user_1 index');
    } catch (err) {
      console.log('Old index product_1_user_1 might not exist or already dropped:', err.message);
    }

    // Sync new indexes
    const Review = require('./src/models/Review.model');
    await Review.syncIndexes();
    console.log('Synced new indexes');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

dropOldIndex();
