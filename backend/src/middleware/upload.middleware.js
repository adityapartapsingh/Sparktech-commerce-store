const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');
const { productImageStorage, datasheetStorage } = require('../config/cloudinary');

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new AppError('Only image files (jpg, jpeg, png, webp) are allowed.', 400));
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new AppError('Only PDF files are allowed for datasheets.', 400));
};

exports.uploadProductImages = multer({
  storage: productImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter,
});

exports.uploadDatasheet = multer({
  storage: datasheetStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: pdfFilter,
});
