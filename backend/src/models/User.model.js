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
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'masteradmin'],
    default: 'customer',
  },
  avatar: String,
  phone: {
    type: String,
    unique: true,
    sparse: true, // Only enforces uniqueness if a string exists
    match: [/^\d{10,15}$/, 'Please enter a valid numeric phone number'],
  },
  addresses: [AddressSchema],
  cart: [{
    product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    variant:  { type: mongoose.Schema.Types.ObjectId },
    quantity: { type: Number, default: 1, min: 1 },
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  refreshToken: { type: String, select: false },
  
  // Advanced Auth Fields
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  
  authProvider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  providerId: { type: String, select: false },
  
  emailOtp: { type: String, select: false },
  emailOtpExpires: { type: Date, select: false },
  
  phoneOtp: { type: String, select: false },
  phoneOtpExpires: { type: Date, select: false },

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
