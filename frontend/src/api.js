import axios from 'axios';

// ---------------------------------------------------------------------------
// 👇 HARDCODE YOUR RENDER URL HERE
// Example: "https://autodraft-backend.onrender.com"
const API_URL = "https://swiftdoc-backend.onrender.com"; 
// ---------------------------------------------------------------------------

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
