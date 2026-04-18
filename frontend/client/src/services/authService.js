import api from './api';

const authService = {
  // Register new user
  async register(userData) {
    const data = await api.post('/auth/register', userData);
    if (data.access_token) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  },

  // Login user
  async login(email, password) {
    const data = await api.post('/auth/login', { email, password });
    if (data.access_token) {
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
    }
    return data;
  },

  // Logout
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },

  // Get current user
  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};

export default authService;
