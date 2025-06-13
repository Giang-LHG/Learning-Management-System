// src/services/subjectService.js
import api from '../utils/api';

/**
 * Lấy danh sách môn học
 */
export async function fetchSubjects() {
  const response = await api.get('/subjects');
  return response.data;
}

/**
 * Tạo mới môn học
 */
export async function createSubject(subjectData) {
  const response = await api.post('/subjects', subjectData);
  return response.data;
}

/**
 * Cập nhật môn học theo id
 */
export async function updateSubject(id, subjectData) {
  const response = await api.put(`/subjects/${id}`, subjectData);
  return response.data;
}

/**
 * Xóa môn học theo id
 */
export async function deleteSubject(id) {
  await api.delete(`/subjects/${id}`);
  return id;
}

/**
 * Tự động lưu nháp môn học
 */
export async function autoSaveDraft(draftData) {
  await api.patch('/subjects/draft', draftData);
}

// Export default để tiện import cả nhóm hàm
export default {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  autoSaveDraft,
};
