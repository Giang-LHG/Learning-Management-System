// src/services/userService.js
import axios from 'axios';

const API_URL = '/api/users'; // hoặc URL bạn đang dùng

const fetchUsers = () => {
  return axios.get(API_URL);
};

const deleteUser = (userId) => {
  return axios.delete(`${API_URL}/${userId}`);
};

const userService = {
  fetchUsers,
  deleteUser,
};

export default userService;
