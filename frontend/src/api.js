import axios from 'axios';

// 1. Try to get the URL from the Environment (Vercel)
// 2. If it doesn't exist, fallback to Localhost (Your Computer)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
