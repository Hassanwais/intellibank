import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const authAxios = () => {
  const token = localStorage.getItem('access_token');
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
};

const transactionService = {
  // Get all transactions for user
  async getTransactions() {
    try {
      const response = await authAxios().get('/transactions/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Transfer money
  async transfer(transferData) {
    try {
      const response = await authAxios().post('/transactions/transfer', transferData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default transactionService; 
