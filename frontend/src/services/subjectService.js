// src/services/subjectService.js
import api from '../utils/api';

/**
 * Fetch the list of subjects
 */
export async function fetchSubjects() {
  const response = await api.get('/subjects');
  return response.data;
}

/**
 * Create a new subject
 */
export async function createSubject(subjectData) {
  const response = await api.post('/subjects', subjectData);
  return response.data;
}

/**
 * Update a subject
 */
export async function updateSubject(subjectId, subjectData) {
  const response = await api.put(`/subjects/${subjectId}`, subjectData);
  return response.data;
}

/**
 * Delete a subject
 */
export async function deleteSubject(subjectId) {
  const response = await api.delete(`/subjects/${subjectId}`);
  return response.data;
}

/**
 * Auto save draft (if implemented)
 */
export async function autoSaveDraft(draftData) {
  const response = await api.post('/subjects/draft', draftData);
  return response.data;
}

/**
 * Change the status of a subject
 */
export async function changeSubjectStatus(subjectId, status, rejectionReason = '') {
  const response = await api.patch(`/subjects/${subjectId}/status`, { status, rejectionReason });
  return response.data;
}

// Export default for convenient import of all functions
export default {
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  autoSaveDraft,
  changeSubjectStatus,
};
