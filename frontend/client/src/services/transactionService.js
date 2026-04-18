import api from './api';

const transactionService = {
  // Get all transactions for user
  async getTransactions() {
    return await api.get('/transactions/');
  },

  // Transfer money
  async transfer(transferData) {
    return await api.post('/transactions/transfer', transferData);
  },

  // Update transaction status (Admin only)
  async updateTransactionStatus(transactionId, status) {
    return await api.put(`/transactions/${transactionId}/status`, { status });
  },

  // Manual user action on flagged transactions
  async resolveFraudAction(transactionId, action) {
    return await api.post(`/transactions/${transactionId}/user-action`, { action });
  }
};

export default transactionService;
