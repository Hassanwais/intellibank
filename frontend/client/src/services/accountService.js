import api from './api';
import { jsPDF } from 'jspdf';

const accountService = {
  async getAccounts() {
    return await api.get('/accounts/');
  },
  
  async getAccountDetails(accountId) {
    return await api.get(`/accounts/${accountId}`);
  },

  async getAccountStatement(accountId, params = {}) {
    return await api.get(`/accounts/${accountId}/statement`, { params });
  },

  async createAccount(accountData) {
    return await api.post('/accounts/', accountData);
  },

  async getAccountTransactions(accountId, limit = 20, offset = 0) {
    return await api.get(`/accounts/${accountId}/transactions`, { params: { limit, offset } });
  },

  async updateAccount(accountId, accountData) {
    return await api.put(`/accounts/${accountId}`, accountData);
  },

  async toggleAccountStatus(accountId, status) {
    return await api.put(`/accounts/${accountId}`, { status });
  },

  async generateStatement(accountId, from_date, to_date, format) {
    if (format === 'csv') {
      const response = await api.get(`/accounts/${accountId}/statement`, {
        params: { from_date, to_date, format },
        responseType: 'blob'
      });
      return response;
    }

    // Fetch statement data
    const data = await api.get(`/accounts/${accountId}/statement`, {
      params: { from_date, to_date, format: 'json' }
    });

    // Build real PDF with jsPDF
    const doc = new jsPDF();
    const transactions = data?.transactions || data?.data?.transactions || [];
    const account = data?.account || data?.data?.account || { account_number: accountId };

    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 80, 200);
    doc.text('IntelliBank — Statement of Account', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(`Account: ${account.account_number || accountId}`, 14, 30);
    doc.text(`Period: ${from_date || 'All'} to ${to_date || new Date().toISOString().split('T')[0]}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 42);

    doc.setDrawColor(30, 80, 200);
    doc.line(14, 46, 196, 46);

    // Table header
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(30, 80, 200);
    doc.rect(14, 48, 182, 8, 'F');
    doc.text('Date', 16, 54);
    doc.text('Description', 45, 54);
    doc.text('Type', 115, 54);
    doc.text('Amount (₦)', 148, 54);
    doc.text('Status', 175, 54);

    let y = 62;
    doc.setTextColor(40, 40, 40);

    if (transactions.length === 0) {
      doc.setFontSize(10);
      doc.text('No transactions found for this period.', 14, y);
    } else {
      transactions.forEach((tx, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        if (idx % 2 === 0) {
          doc.setFillColor(245, 247, 255);
          doc.rect(14, y - 4, 182, 8, 'F');
        }
        const date = tx.created_at ? new Date(tx.created_at).toLocaleDateString() : '-';
        const desc = (tx.description || '').substring(0, 35);
        const type = tx.transaction_type || '';
        const amount = `${tx.amount?.toLocaleString() || '0'}`;
        const status = tx.status || '';
        doc.setFontSize(8);
        doc.text(date, 16, y);
        doc.text(desc, 45, y);
        doc.text(type, 115, y);
        doc.text(amount, 148, y);
        doc.text(status, 175, y);
        y += 9;
      });
    }

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y + 5, 196, y + 5);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text('This is a computer-generated statement. IntelliBank PLC — intellibank.ng', 14, y + 11);

    return doc.output('blob');
  }
};

export default accountService;