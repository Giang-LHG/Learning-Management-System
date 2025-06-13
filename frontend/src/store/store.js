// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import subjectReducer from './slices/subjectSlice';
import userReducer from './slices/userSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    subjects: subjectReducer,
    users: userReducer
  }
});