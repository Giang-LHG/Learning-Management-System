const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/lms_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedUser = async () => {
  try {
    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ username: 'admin001' });
    if (existingUser) {
      console.log('User admin001 đã tồn tại!');
      process.exit(0);
    }

    // Tạo password hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('secureadmin123', salt);

    // Tạo user mới
    const newUser = new User({
      username: 'admin001',
      email: 'admin001@example.com',
      passwordHash: passwordHash,
      role: 'admin',
      profile: {
        fullName: 'Admin User',
        avatarUrl: '',
      }
    });

    const savedUser = await newUser.save();
    console.log('User đã được tạo thành công:', {
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      fullName: savedUser.profile.fullName
    });

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi tạo user:', error);
    process.exit(1);
  }
};

seedUser(); 