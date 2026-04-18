import api from './api';

const fraudService = {
  // Get all fraud alerts for the logged-in user
  async getFraudAlerts() {
    return await api.get('/fraud/alerts');
  },

  // Analyze a transaction for fraud
  async analyzeTransaction(transactionId, locationData = {}) {
    return await api.post('/fraud/analyze', {
      transaction_id: transactionId,
      distance_from_home: locationData.distance || 0,
      is_international: locationData.isInternational || false
    });
  },

  // Update fraud alert status (reviewed, false positive, etc.)
  async updateAlertStatus(alertId, status, notes = '') {
    return await api.put(`/fraud/alerts/${alertId}`, {
      status: status,
      resolution_notes: notes
    });
  },

  // Get fraud statistics
  async getFraudStats() {
    return await api.get('/fraud/stats');
  },

  // Helper function to get color based on risk level
  getRiskColor(riskLevel) {
    const colors = {
      'Low': '#28a745',     // Green
      'Medium': '#ffc107',   // Yellow
      'High': '#fd7e14',     // Orange
      'Critical': '#dc3545'  // Red
    };
    return colors[riskLevel] || '#6c757d';
  },

  // Helper function to get icon based on risk level
  getRiskIcon(riskLevel) {
    const icons = {
      'Low': '✅',
      'Medium': '⚠️',
      'High': '🔴',
      'Critical': '🚨'
    };
    return icons[riskLevel] || '❓';
  }
};

export default fraudService;
