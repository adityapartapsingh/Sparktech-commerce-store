const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AddressSchema = new mongoose.Schema({
  label:    { type: String, default: 'Home' },
  line1:    { type: String, required: true },
  line2:    String,
  city:     { type: String, required: true },
  state:    { type: String, required: true },
  pincode:  { type: String, required: true },
  country:  { type: String, default: 'India' },
  phone:    String,
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'masteradmin'],
    default: 'customer',
  },
  avatar: String,
  phone: String,
  addresses: [AddressSchema],
  cart: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variant:  { type: mongoose.Schema.Types.ObjectId },
    quantity: { type: Number, default: 1, min: 1 },
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  refreshToken: { type: String, select: false },
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

// Hash password before save
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
