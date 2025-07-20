// controllers/authController.js
const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendMail } = require('../../utils/email');

const createErrorResponse = (status, message) => ({ status, message });

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

// Register
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

    // Generate token for newly registered user
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

// Login
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }]
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json(createErrorResponse(401, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return res.status(401).json(createErrorResponse(401, 'Invalid password'));
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date();
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    // Generate JWT token
    const token = generateToken(user._id);

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

// Send forgot password OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email does not exist' });
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    // Send email
    await sendMail(email, 'Your OTP for password reset', `Your OTP is: ${otp}`);
    res.json({ success: true, message: 'OTP has been sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Reset password with OTP
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
      return res.status(400).json({ success: false, message: 'Invalid request' });
    }
    if (user.resetPasswordOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }
    if (user.resetPasswordOTPExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }
    // Reset password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;
    await user.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide all required information.' });
    }

    const user = await User.findById(userId).select('+passwordHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};
