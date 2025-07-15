const express = require('express');
const router  = express.Router();

const notificationController = require('../../controllers/notification/notificationController');
router.get('/',                 notificationController.getNotifications);
router.patch('/:id/read',        notificationController.markNotificationRead);
router.patch('/read-all',        notificationController.markAllRead);
router.get('/unread-count',       notificationController.countUnread);

module.exports = router;