// controllers/userController.js
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Helper: Tạo response error
const createErrorResponse = (status, message) => ({ status, message });

// Lấy tất cả users (có phân trang và lọc)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, status } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status !== undefined) filter.isActive = status === 'active';
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Lấy thông tin profile của user hiện tại
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Sử dụng _id thay vì id
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json(createErrorResponse(404, 'User not found'));
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get current user profile error:', err);
    res.status(500).json(createErrorResponse(500, 'Server error'));
  }
};

// Cập nhật profile của user hiện tại
exports.updateCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Sử dụng _id thay vì id
    const updates = req.body;
    
    // Xử lý mật khẩu mới nếu có
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(updates.password, salt);
      delete updates.password;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json(createErrorResponse(404, 'User not found'));
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Update current user profile error:', err);
    res.status(500).json(createErrorResponse(500, 'Update failed'));
  }
};

// Lấy thông tin user
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json(createErrorResponse(404, 'User not found'));
    }
    
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json(createErrorResponse(500, 'Server error'));
  }
};

// Cập nhật thông tin user
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;
    
    // Xử lý mật khẩu mới nếu có
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(updates.password, salt);
      delete updates.password;
    }
    
    // Xử lý profile theo role
    if (updates.profile) {
      const user = await User.findById(userId);
      const role = updates.role || user.role;
      
      // Chỉ student mới có parentIds
      if (role !== 'student') {
        updates.profile.parentIds = undefined;
      }
      
      // Chỉ instructor mới có bio và expertise
      if (role !== 'instructor') {
        updates.profile.bio = undefined;
        updates.profile.expertise = undefined;
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!updatedUser) {
      return res.status(404).json(createErrorResponse(404, 'User not found'));
    }
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json(createErrorResponse(500, 'Update failed'));
  }
};

// Xóa user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json(createErrorResponse(404, 'User not found'));
    }
    
    res.json({ 
      message: 'User deleted successfully',
      userId: deletedUser._id
    });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json(createErrorResponse(500, 'Delete failed'));
  }
};

// Lấy danh sách user theo vai trò (option)
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    if (!role) {
      return res.status(400).json(createErrorResponse(400, 'Role parameter is required'));
    }
    
    const users = await User.find({ role }).select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('Get users by role error:', err);
    res.status(500).json(createErrorResponse(500, 'Server error'));
  }
};