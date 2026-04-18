import api from './api';

const reportService = {
  getMonthlyStatement: async (params) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/reports/monthly-statement?${queryParams}`, {
      responseType: 'blob'
    });
    return response.data;
  },
  
  getFraudSummary: async (params) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await api.get(`/reports/fraud-summary?${queryParams}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default reportService;
