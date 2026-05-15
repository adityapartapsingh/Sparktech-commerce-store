const express = require('express');
const router = express.Router();
const NotificationsController = require('./notifications.controller');
const { protect } = require('../../middleware/auth.middleware');

router.use(protect);

router.get('/', NotificationsController.getNotifications);
router.patch('/read-all', NotificationsController.markAllAsRead);
router.patch('/:id/read', NotificationsController.markAsRead);
router.delete('/:id', NotificationsController.deleteNotification);

module.exports = router;
