// axiosClient.js
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// attach token if present
axiosClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth');
  if (raw) {
    try {
      const auth = JSON.parse(raw);
      if (auth && auth.token) {
        config.headers.Authorization = `Bearer ${auth.token}`;
      }
    } catch (e) {
      // ignore
    }
  }
  return config;
}, (error) => Promise.reject(error));

export default axiosClient;
