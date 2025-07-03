// controllers/notificationController.js

const mongoose      = require('mongoose');
const Notification  = require('../../models/Notification');

/**
 * GET /api/notifications

 */
exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    const notes = await Notification.find({ toUserId: userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.json({ success: true, data: notes });
  } catch (err) {
    console.error('Error in getNotifications:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/notifications/:id/read

 */
exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid notification id' });
    }
    const note = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    ).lean();
    if (!note) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    return res.json({ success: true, data: note });
  } catch (err) {
    console.error('Error in markNotificationRead:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * PATCH /api/notifications/read-all

 */
exports.markAllRead = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    await Notification.updateMany(
      { toUserId: userId, read: false },
      { read: true }
    );
    return res.json({ success: true, message: 'All notifications marked read' });
  } catch (err) {
    console.error('Error in markAllRead:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * GET /api/notifications/unread-count

 */
exports.countUnread = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid userId' });
    }
    const cnt = await Notification.countDocuments({ toUserId: userId, read: false });
    return res.json({ success: true, data: { unreadCount: cnt } });
  } catch (err) {
    console.error('Error in countUnread:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
