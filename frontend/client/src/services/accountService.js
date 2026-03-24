import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const accountService = {
  // Get all accounts for logged in user
  async getAccounts() {
    try {
      const token = localStorage.getItem('access_token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      console.log('Making API call to /accounts/ with token');
      const response = await axios.get(`${API_URL}/accounts/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Accounts response received:', response.data);
      
      // Make sure we return the data in the expected format
      return response.data; // This should be { accounts: [...] }
    } catch (error) {
      console.error('Error in getAccounts:', error.response || error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      
      throw error.response?.data || { error: 'Failed to load accounts' };
    }
  },

  // Get single account details
  async getAccount(accountId) {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`${API_URL}/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching account:', error.response || error);
      throw error.response?.data || { error: 'Failed to load account' };
    }
  },

  // Get account transactions
  async getAccountTransactions(accountId) {
    try {
      const token = localStorage.getItem('access_token');
      
      console.log(`Fetching transactions for account ${accountId}`);
      const response = await axios.get(`${API_URL}/accounts/${accountId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Transactions response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error.response || error);
      throw error.response?.data || { error: 'Failed to load transactions' };
    }
  }
};

export default accountService;