import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const fraudService = {
  // Get all fraud alerts for the logged-in user
  async getFraudAlerts() {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`${API_URL}/fraud/alerts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching fraud alerts:', error.response || error);
      throw error.response?.data || { error: 'Failed to load fraud alerts' };
    }
  },

  // Analyze a transaction for fraud
  async analyzeTransaction(transactionId, locationData = {}) {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(`${API_URL}/fraud/analyze`, {
        transaction_id: transactionId,
        distance_from_home: locationData.distance || 0,
        is_international: locationData.isInternational || false
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error analyzing transaction:', error.response || error);
      throw error.response?.data || { error: 'Failed to analyze transaction' };
    }
  },

  // Update fraud alert status (reviewed, false positive, etc.)
  async updateAlertStatus(alertId, status, notes = '') {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.put(`${API_URL}/fraud/alerts/${alertId}`, {
        status: status,
        resolution_notes: notes
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating alert:', error.response || error);
      throw error.response?.data || { error: 'Failed to update alert' };
    }
  },

  // Get fraud statistics
  async getFraudStats() {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await axios.get(`${API_URL}/fraud/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching fraud stats:', error.response || error);
      throw error.response?.data || { error: 'Failed to load fraud stats' };
    }
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
