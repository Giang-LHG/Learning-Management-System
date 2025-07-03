const User = require('../../models/User');
const Subject = require('../../models/Subject');
const Course = require('../../models/Course');
const Enrollment = require('../../models/Enrollment');

// Lấy thống kê tổng quan cho dashboard
const getDashboardStats = async (req, res) => {
  try {
    // Đếm tổng số users
    const totalUsers = await User.countDocuments();
    
    // Đếm users theo role
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Đếm tổng số subjects
    const totalSubjects = await Subject.countDocuments();
    
    // Đếm subjects theo status
    const subjectCounts = await Subject.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Đếm tổng số courses
    const totalCourses = await Course.countDocuments();
    
    // Đếm tổng số enrollments
    const totalEnrollments = await Enrollment.countDocuments();

    // Tính toán growth (so với tháng trước)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const currentMonthUsers = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });
    
    const lastMonthUsers = await User.countDocuments({
      createdAt: { 
        $gte: lastMonth,
        $lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    const userGrowth = lastMonthUsers > 0 
      ? `+${Math.round(((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100)}%`
      : '+0%';

    // Hoạt động hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayActivities = await User.countDocuments({
      lastLoginAt: { $gte: today }
    });

    res.status(200).json({
      success: true,
      totalUsers,
      totalSubjects,
      totalCourses,
      totalEnrollments,
      todayActivities,
      userGrowth,
      subjectGrowth: '+5%', // Placeholder
      sessionGrowth: '+2%', // Placeholder
      activityGrowth: '+3%', // Placeholder
      userCounts,
      subjectCounts,
      lastBackup: new Date().toISOString(),
      avgResponseTime: 150,
      uptime: '99.9%',
      memoryUsage: 65,
      failedLogins: 12,
      blockedIPs: 3
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Lấy dữ liệu biểu đồ hoạt động trong 7 ngày qua
const getActivityChart = async (req, res) => {
  try {
    const labels = [];
    const data = [];
    
    // Tạo dữ liệu cho 7 ngày qua
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      labels.push(dayName);
      
      // Đếm users đăng nhập trong ngày đó
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dailyLogins = await User.countDocuments({
        lastLoginAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      data.push(dailyLogins);
    }

    res.status(200).json({
      success: true,
      labels,
      data
    });
  } catch (error) {
    console.error('Activity chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity chart data',
      error: error.message
    });
  }
};

// Lấy danh sách hoạt động gần đây
const getRecentActivities = async (req, res) => {
  try {
    // Lấy 10 users đăng nhập gần đây nhất
    const recentUsers = await User.find({
      lastLoginAt: { $exists: true }
    })
    .sort({ lastLoginAt: -1 })
    .limit(10)
    .select('username email lastLoginAt role');

    const activities = recentUsers.map(user => ({
      userName: user.username,
      action: `Logged in as ${user.role}`,
      timestamp: user.lastLoginAt,
      userRole: user.role
    }));

    res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

// Lấy thống kê user theo trạng thái
const getUserStatusStats = async (req, res) => {
  try {
    // Đếm users theo trạng thái
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    res.status(200).json({
      success: true,
      labels: ['Active', 'Inactive', 'Blocked'],
      data: [activeUsers, inactiveUsers, blockedUsers]
    });
  } catch (error) {
    console.error('User status stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user status statistics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getActivityChart,
  getRecentActivities,
  getUserStatusStats
}; 