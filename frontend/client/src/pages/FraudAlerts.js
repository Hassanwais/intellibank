import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fraudService from '../services/fraudService';
import authService from '../services/authService';
import './FraudAlerts.css';

function FraudAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch both alerts and stats
      const [alertsData, statsData] = await Promise.all([
        fraudService.getFraudAlerts(),
        fraudService.getFraudStats()
      ]);
      
      setAlerts(alertsData.alerts || []);
      setStats(statsData);
    } catch (err) {
      setError(err.error || 'Failed to load fraud data');
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setShowDetails(true);
  };

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await fraudService.updateAlertStatus(alertId, newStatus, 'Reviewed by user');
      // Refresh data
      fetchData();
      setShowDetails(false);
    } catch (err) {
      setError('Failed to update alert status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) return <div className="loading">Loading fraud detection system...</div>;

  return (
    <div className="fraud-page">
      <div className="fraud-header">
        <h1>🚨 AI Fraud Detection System</h1>
        <button className="refresh-btn" onClick={fetchData}>🔄 Refresh</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Transactions</h3>
            <p className="stat-value">{stats.total_transactions || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Flagged Transactions</h3>
            <p className="stat-value">{stats.flagged_transactions || 0}</p>
          </div>
          <div className="stat-card">
            <h3>Fraud Percentage</h3>
            <p className="stat-value">{(stats.fraud_percentage || 0).toFixed(1)}%</p>
          </div>
          <div className="stat-card">
            <h3>Pending Review</h3>
            <p className="stat-value">{stats.pending_review || 0}</p>
          </div>
        </div>
      )}

      {/* Alerts by Severity */}
      {stats && (
        <div className="severity-section">
          <h2>Alerts by Severity</h2>
          <div className="severity-bars">
            <div className="severity-item">
              <span className="severity-label">Critical</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar critical" 
                  style={{ width: `${(stats.alerts_by_severity?.Critical || 0) / (alerts.length || 1) * 100}%` }}
                ></div>
              </div>
              <span className="severity-count">{stats.alerts_by_severity?.Critical || 0}</span>
            </div>
            <div className="severity-item">
              <span className="severity-label">High</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar high" 
                  style={{ width: `${(stats.alerts_by_severity?.High || 0) / (alerts.length || 1) * 100}%` }}
                ></div>
              </div>
              <span className="severity-count">{stats.alerts_by_severity?.High || 0}</span>
            </div>
            <div className="severity-item">
              <span className="severity-label">Medium</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar medium" 
                  style={{ width: `${(stats.alerts_by_severity?.Medium || 0) / (alerts.length || 1) * 100}%` }}
                ></div>
              </div>
              <span className="severity-count">{stats.alerts_by_severity?.Medium || 0}</span>
            </div>
            <div className="severity-item">
              <span className="severity-label">Low</span>
              <div className="severity-bar-container">
                <div 
                  className="severity-bar low" 
                  style={{ width: `${(stats.alerts_by_severity?.Low || 0) / (alerts.length || 1) * 100}%` }}
                ></div>
              </div>
              <span className="severity-count">{stats.alerts_by_severity?.Low || 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="alerts-section">
        <h2>Recent Fraud Alerts</h2>
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <p>✅ No fraud alerts detected. Your account is secure!</p>
          </div>
        ) : (
          <div className="alerts-list">
            {alerts.map(alert => (
              <div 
                key={alert.fraud_id} 
                className={`alert-card ${alert.status.toLowerCase()}`}
                onClick={() => handleAlertClick(alert)}
              >
                <div className="alert-icon">
                  {fraudService.getRiskIcon(alert.alert_severity)}
                </div>
                <div className="alert-details">
                  <div className="alert-header">
                    <span className="alert-type">{alert.fraud_type}</span>
                    <span 
                      className="alert-severity" 
                      style={{ backgroundColor: fraudService.getRiskColor(alert.alert_severity) }}
                    >
                      {alert.alert_severity}
                    </span>
                  </div>
                  <div className="alert-description">{alert.description}</div>
                  <div className="alert-meta">
                    <span className="alert-amount">{formatCurrency(alert.amount)}</span>
                    <span className="alert-date">{formatDate(alert.created_at)}</span>
                    <span className="alert-confidence">AI Confidence: {(alert.confidence_score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="alert-status">
                    Status: <span className={`status-badge ${alert.status.toLowerCase()}`}>{alert.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Alert Details Modal */}
      {showDetails && selectedAlert && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Alert Details</h2>
            <button className="close-btn" onClick={() => setShowDetails(false)}>×</button>
            
            <div className="alert-detail-grid">
              <div className="detail-row">
                <span className="detail-label">Alert ID:</span>
                <span className="detail-value">{selectedAlert.fraud_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value">{selectedAlert.transaction_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Amount:</span>
                <span className="detail-value">{formatCurrency(selectedAlert.amount)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Detection Method:</span>
                <span className="detail-value">{selectedAlert.detected_by}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Fraud Type:</span>
                <span className="detail-value">{selectedAlert.fraud_type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Confidence Score:</span>
                <span className="detail-value">{(selectedAlert.confidence_score * 100).toFixed(1)}%</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Severity:</span>
                <span 
                  className="detail-value severity-badge"
                  style={{ backgroundColor: fraudService.getRiskColor(selectedAlert.alert_severity) }}
                >
                  {selectedAlert.alert_severity}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-badge ${selectedAlert.status.toLowerCase()}`}>
                  {selectedAlert.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Detected At:</span>
                <span className="detail-value">{formatDate(selectedAlert.created_at)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description:</span>
                <span className="detail-value">{selectedAlert.description}</span>
              </div>
            </div>

            {selectedAlert.status === 'Pending' && (
              <div className="alert-actions">
                <h3>Review Alert</h3>
                <div className="action-buttons">
                  <button 
                    className="action-btn review"
                    onClick={() => handleUpdateStatus(selectedAlert.fraud_id, 'Reviewed')}
                  >
                    Mark as Reviewed
                  </button>
                  <button 
                    className="action-btn false-positive"
                    onClick={() => handleUpdateStatus(selectedAlert.fraud_id, 'False Positive')}
                  >
                    False Positive
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FraudAlerts; 
