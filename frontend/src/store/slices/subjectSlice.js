// src/store/slices/subjectSlice.js
import { createSlice } from '@reduxjs/toolkit';

const subjectSlice = createSlice({
  name: 'subjects',
  initialState: {
    data: [],
    loading: false,
    error: null
  },
  reducers: {
    fetchSubjectsStart(state) {
      state.loading = true;
    },
    fetchSubjectsSuccess(state, action) {
      state.data = action.payload;
      state.loading = false;
    },
    fetchSubjectsFailure(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
    addSubject(state, action) {
      state.data.push(action.payload);
    },
    deleteSubject(state, action) {
      state.data = state.data.filter(subject => subject.id !== action.payload);
    }
  }
});

export const { 
  fetchSubjectsStart, 
  fetchSubjectsSuccess,
  fetchSubjectsFailure,
  addSubject,
  deleteSubject
} = subjectSlice.actions;

export default subjectSlice.reducer;