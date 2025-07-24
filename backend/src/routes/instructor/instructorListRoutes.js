const express = require('express');
const router = express.Router();
const User = require('../../models/User');

// Public API: Lấy danh sách instructor (chỉ trả về _id, username, profile.fullName, email)
router.get('/list', async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('_id username profile.fullName email');
    res.json({ success: true, instructors });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 