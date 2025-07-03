// controllers/authController.js
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const createErrorResponse = (status, message) => ({ status, message });

// Tạo JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Đăng ký
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role, profile } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      const message = existingUser.username === username 
        ? 'Username already exists' 
        : 'Email is already registered';
      return res.status(409).json(createErrorResponse(409, message));
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      passwordHash,
      role,
      profile: {
        fullName: profile.fullName,
        avatarUrl: profile.avatarUrl || '',
        ...(role === 'student' && { parentIds: profile.parentIds || [] }),
        ...(role === 'instructor' && {
          bio: profile.bio || '',
          expertise: profile.expertise || ''
        })
      }
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.passwordHash;

    // Tạo token cho user mới đăng ký
    const token = generateToken(savedUser._id);

    res.status(201).json({
      user: userResponse,
      token: token
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json(createErrorResponse(500, 'Server error'));
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // console.log('Login attempt:', { identifier, password: password ? '***' : 'undefined' });

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select('+passwordHash');

    // console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('No user found with identifier:', identifier);
      return res.status(401).json(createErrorResponse(401, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    // console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Password does not match for user:', user.username);
      return res.status(401).json(createErrorResponse(401, 'Invalid password'));
    }

    // Cập nhật lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    // Tạo JWT token
    const token = generateToken(user._id);

    // console.log('Login successful for user:', user.username);

    res.json({
      user: userResponse,
      token: token,
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(createErrorResponse(500, 'Login failed'));
  }
};
