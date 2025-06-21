// src/services/userService.js
import api from '../utils/api';

/**
 * Lấy danh sách tất cả users
 */
export async function fetchUsers() {
  const response = await api.get('/users');
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

export default {
  fetchUsers,
  fetchUserById,
  updateUser,
  deleteUser,
  fetchUsersByRole,
  fetchCurrentUserProfile,
  updateCurrentUserProfile,
};
