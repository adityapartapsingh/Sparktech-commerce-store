const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const { protect } = require('../../middleware/auth.middleware');
const { authorize } = require('../../middleware/rbac.middleware');

// Admin & MasterAdmin exact boundary
router.get('/', protect, authorize('admin', 'masteradmin'), UserController.getAllCustomers);

module.exports = router;
