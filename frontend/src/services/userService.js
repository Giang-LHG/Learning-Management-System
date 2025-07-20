import api from '../utils/api';

/**
 * Lấy danh sách tất cả users
 */
export async function fetchUsers() {
  const response = await api.get('/users');
  return response.data;
}

/**
 * Tạo người dùng mới
 */
export async function createUser(userData) {
  const response = await api.post('/users', userData);
  return response.data;
}

/**
 * Lấy thông tin user theo ID
 */
export async function fetchUserById(userId) {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

/**
 * Cập nhật thông tin user
 */
export async function updateUser(userId, userData) {
  const response = await api.put(`/users/${userId}`, userData);
  return response.data;
}

/**
 * Xóa user
 */
export async function deleteUser(userId) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}

/**
 * Lấy users theo role
 */
export async function fetchUsersByRole(role) {
  const response = await api.get(`/users?role=${role}`);
  return response.data;
}

/**
 * Lấy thông tin profile của user hiện tại
 */
export async function fetchCurrentUserProfile() {
  const response = await api.get('/users/profile');
  return response.data;
}

/**
 * Cập nhật profile của user hiện tại
 */
export async function updateCurrentUserProfile(profileData) {
  const response = await api.put('/users/profile', profileData);
  return response.data;
}

/**
 * Change the status of a user
 */
export async function changeUserStatus(userId, status) {
  const response = await api.patch(`/users/${userId}/status`, { status });
  return response.data;
}

export default {
  fetchUsers,
  createUser, // Thêm vào export default
  fetchUserById,
  updateUser,
  deleteUser,
  fetchUsersByRole,
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
  changeUserStatus,
};