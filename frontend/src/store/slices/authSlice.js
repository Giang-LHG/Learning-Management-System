// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

/**
 * Async thunk cho đăng nhập
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data; // data chứa { user, token }
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Lỗi không xác định');
    }
  }
);

/**
 * Async thunk cho đăng ký
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const data = await authService.register(userData);
      // Lưu token vào localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      return data; // data chứa { user, token }
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Lỗi đăng ký');
    }
  }
);

// Khôi phục trạng thái từ localStorage
const getInitialState = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  
  return {
    user: user ? JSON.parse(user) : null,
    token: token,
    loading: false,
    error: null,
    registerSuccess: false,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      state.registerSuccess = false;
      // Xóa token khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    resetRegisterStatus: (state) => {
      state.registerSuccess = false; // Reset trạng thái đăng ký
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        // Lưu user vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Xử lý register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.registerSuccess = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.registerSuccess = true;
        // Lưu user vào localStorage
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.registerSuccess = false;
      });
  },
});

export const { logout, resetRegisterStatus } = authSlice.actions;
export default authSlice.reducer;