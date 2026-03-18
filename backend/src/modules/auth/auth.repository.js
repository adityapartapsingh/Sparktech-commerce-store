const User = require('../../models/User.model');

exports.findByEmail = (email) => User.findOne({ email }).select('+password +refreshToken');
exports.findById = (id) => User.findById(id);
exports.create = (data) => User.create(data);
exports.updateRefreshToken = (id, token) => User.findByIdAndUpdate(id, { refreshToken: token });
exports.clearRefreshToken = (id) => User.findByIdAndUpdate(id, { refreshToken: null });
exports.findByResetToken = (token) =>
  User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
exports.updatePassword = (id, password) =>
  User.findByIdAndUpdate(id, { password, resetPasswordToken: undefined, resetPasswordExpires: undefined });
