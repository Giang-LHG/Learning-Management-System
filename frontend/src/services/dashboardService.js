import api from '../utils/api';

/**
 * Lấy thống kê tổng quan cho dashboard
 */
export async function fetchDashboardStats() {
  const response = await api.get('/dashboard/stats');
  return response.data;
}

/**
 * Lấy dữ liệu biểu đồ hoạt động trong 7 ngày qua
 */
export async function fetchActivityChart() {
  const response = await api.get('/dashboard/activity-chart');
  return response.data;
}

/**
 * Lấy danh sách hoạt động gần đây
 */
export async function fetchRecentActivities() {
  const response = await api.get('/dashboard/recent-activities');
  return response.data;
}

/**
 * Lấy thống kê user theo trạng thái
 */
export async function fetchUserStatusStats() {
  const response = await api.get('/dashboard/user-status');
  return response.data;
}

/**
 * Gửi yêu cầu sinh report
 */
export async function generateReport({ date, reportType }) {
  const response = await api.post('/dashboard/generate-report', { date, reportType });
  return response.data;
}

export default {
  fetchDashboardStats,
  fetchActivityChart,
  fetchRecentActivities,
  fetchUserStatusStats,
  generateReport,
}; 