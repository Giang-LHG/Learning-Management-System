// controllers/userController.js
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Helper: Tạo response error
const createErrorResponse = (status, message) => ({ status, message });

// Đăng ký người dùng mới
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role, profile } = req.body;

    // Kiểm tra username/email đã tồn tại
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const message = existingUser.username === username 
        ? 'Username already exists' 
        : 'Email is already registered';
      return res.status(409).json(createErrorResponse(409, message));
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Tạo user mới với dữ liệu phù hợp theo role
    const newUser = new User({
      username,
      email,
      passwordHash,
      role,
      profile: {
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl || '',
        ...(role === 'student' && { 
          parentIds: profile.parentIds || [] 
        }),
        ...(role === 'instructor' && {
          bio: profile.bio || '',
          expertise: profile.expertise || ''
        })
      }
    });

    const savedUser = await newUser.save();
    
    // Tạo response (loại bỏ passwordHash)
    const userResponse = savedUser.toObject();
    delete userResponse.passwordHash;
    
    res.status(201).json(userResponse);
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json(createErrorResponse(500, 'Server error'));
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier có thể là username hoặc email

    console.log('Login attempt with:', { identifier, password });
    
    // Tìm user theo username hoặc email
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select('+passwordHash');
    // console.log('User found:', user);
    
    if (!user) {
      return res.status(401).json(createErrorResponse(401, 'Invalid credentials'));
    }

    // Xác thực mật khẩu
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(createErrorResponse(401, 'Invalid password'));
    }

    // Tạo response (loại bỏ passwordHash)
    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    
    res.json({
      ...userResponse,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(createErrorResponse(500, 'Login failed'));
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