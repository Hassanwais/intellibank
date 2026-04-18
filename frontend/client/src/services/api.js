import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In local dev, the Vite proxy forwards /api → http://localhost:5001.
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    // Only return data immediately if we know what format it takes, but Axios needs the raw response for edge cases. 
    // In many React apps we return `response.data` directly. Let's return just `response.data` to simplify usage in services.
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token probably expired or unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default api;
