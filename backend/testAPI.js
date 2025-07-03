// Script test API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:8021/api';

// Test data
const testUser = {
  username: 'admin001',
  email: 'admin@example.com',
  password: 'password123'
};

async function testAPI() {
  console.log('=== Testing API Endpoints ===\n');

  try {
    // 1. Test login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      identifier: testUser.username,
      password: testUser.password
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user.username, '- Role:', loginResponse.data.user.role);
    console.log('Token received:', token ? 'Yes' : 'No\n');

    // 2. Test get users (admin only)
    console.log('2. Testing get users...');
    const usersResponse = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get users successful');
    console.log('Total users:', usersResponse.data.total);
    console.log('Users returned:', usersResponse.data.users.length);
    console.log('Sample user:', {
      username: usersResponse.data.users[0]?.username,
      role: usersResponse.data.users[0]?.role,
      isActive: usersResponse.data.users[0]?.isActive
    });
    console.log('');

    // 3. Test get current user profile
    console.log('3. Testing get current user profile...');
    const profileResponse = await axios.get(`${API_BASE}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Get profile successful');
    console.log('Profile data:', {
      username: profileResponse.data.username,
      email: profileResponse.data.email,
      role: profileResponse.data.role,
      fullName: profileResponse.data.profile?.fullName
    });
    console.log('');

    // 4. Test dashboard stats
    console.log('4. Testing dashboard stats...');
    const statsResponse = await axios.get(`${API_BASE}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Dashboard stats successful');
    console.log('Stats:', {
      totalUsers: statsResponse.data.totalUsers,
      totalSubjects: statsResponse.data.totalSubjects,
      todayActivities: statsResponse.data.todayActivities
    });
    console.log('');

    // 5. Test activity chart
    console.log('5. Testing activity chart...');
    const chartResponse = await axios.get(`${API_BASE}/dashboard/activity-chart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Activity chart successful');
    console.log('Chart data:', {
      labels: chartResponse.data.labels,
      dataPoints: chartResponse.data.data.length
    });
    console.log('');

    // 6. Test recent activities
    console.log('6. Testing recent activities...');
    const activitiesResponse = await axios.get(`${API_BASE}/dashboard/recent-activities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Recent activities successful');
    console.log('Activities returned:', activitiesResponse.data.activities.length);
    if (activitiesResponse.data.activities.length > 0) {
      console.log('Sample activity:', activitiesResponse.data.activities[0]);
    }
    console.log('');

    // 7. Test user status stats
    console.log('7. Testing user status stats...');
    const statusResponse = await axios.get(`${API_BASE}/dashboard/user-status`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ User status stats successful');
    console.log('Status data:', {
      labels: statusResponse.data.labels,
      data: statusResponse.data.data
    });
    console.log('');

    console.log('🎉 All API tests passed successfully!');

  } catch (error) {
    console.error('❌ API test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Chạy test
testAPI(); 