// Script để cập nhật Users collection
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Schema tạm thời để update
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    role: String,
    roles: String, // Field cũ
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: null },
    profile: {
        fullName: String,
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
        bio: { type: String, default: '' },
        avatarUrl: { type: String, default: '' },
        studentId: { type: String, default: '' },
        className: { type: String, default: '' },
        parentIds: [mongoose.Schema.Types.ObjectId],
        department: { type: String, default: '' },
        expertise: { type: String, default: '' }
    },
    createdAt: Date,
    updatedAt: Date
}, { collection: 'Users' });

const User = mongoose.model('User', UserSchema);

async function updateUsersCollection() {
    try {
        console.log('Starting users collection update...');

        // Lấy tất cả users
        const users = await User.find({});
        console.log(`Found ${users.length} users to update`);

        for (const user of users) {
            const updateData = {};

            // 1. Sửa field roles thành role nếu cần
            if (user.roles && !user.role) {
                updateData.role = user.roles;
                console.log(`Updating user ${user.username}: roles -> role`);
            }

            // 2. Thêm các trường mới nếu chưa có
            if (user.isActive === undefined) {
                updateData.isActive = true;
            }
            if (user.isBlocked === undefined) {
                updateData.isBlocked = false;
            }
            if (!user.lastLoginAt) {
                updateData.lastLoginAt = null;
            }

            // 3. Cập nhật profile với các trường mới
            const profileUpdates = {};
            if (!user.profile.phone) profileUpdates.phone = '';
            if (!user.profile.address) profileUpdates.address = '';
            if (!user.profile.bio) profileUpdates.bio = '';
            if (!user.profile.studentId) profileUpdates.studentId = '';
            if (!user.profile.className) profileUpdates.className = '';
            if (!user.profile.department) profileUpdates.department = '';

            if (Object.keys(profileUpdates).length > 0) {
                updateData['profile'] = { ...user.profile, ...profileUpdates };
            }

            // 4. Thực hiện update nếu có thay đổi
            if (Object.keys(updateData).length > 0) {
                await User.findByIdAndUpdate(user._id, { $set: updateData });
                console.log(`Updated user: ${user.username}`);
            } else {
                console.log(`User ${user.username} is already up to date`);
            }
        }

        console.log('Users collection update completed successfully!');

        // Hiển thị thống kê
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const usersWithLastLogin = await User.countDocuments({ lastLoginAt: { $exists: true, $ne: null } });

        console.log('\n=== Collection Statistics ===');
        console.log(`Total Users: ${totalUsers}`);
        console.log(`Active Users: ${activeUsers}`);
        console.log(`Blocked Users: ${blockedUsers}`);
        console.log(`Users with Last Login: ${usersWithLastLogin}`);

        // Hiển thị sample user để kiểm tra
        const sampleUser = await User.findOne().select('-passwordHash');
        console.log('\n=== Sample User Structure ===');
        console.log(JSON.stringify(sampleUser, null, 2));

    } catch (error) {
        console.error('Error updating users collection:', error);
    } finally {
        mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Chạy script
updateUsersCollection(); 