require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order.model');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const orders = await Order.find().lean();
    console.log(JSON.stringify(orders.map(o => ({ _id: o._id, sliced: o._id.toString().slice(-8).toUpperCase(), status: o.status })), null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

checkOrders();
