import api from './api';

const adminService = {
  // Get high-level system statistics
  async getDashboardStats() {
    return await api.get('/admin/dashboard');
  }
};

export default adminService;
