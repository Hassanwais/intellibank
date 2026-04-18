import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Grid, Card, CardContent, Typography, Button, IconButton, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Avatar,
  Alert, Snackbar, LinearProgress, Tabs, Tab, InputAdornment, FormControl, InputLabel,
  Select, Tooltip, Badge, AvatarGroup, Stepper, Step, StepLabel
} from '@mui/material';
import {
  Warning, Security, CheckCircle, Cancel, Visibility, Block, Check,
  TrendingUp, TrendingDown, Timeline, Analytics, Speed, Shield, WarningAmber
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import fraudService from '../services/fraudService';
import authService from '../services/authService';
import transactionService from '../services/transactionService';

const FraudAlerts = () => {
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
      const [alertsData, statsData] = await Promise.all([
        fraudService.getFraudAlerts(),
        fraudService.getFraudStats()
      ]);
      setAlerts(alertsData.alerts || []);
      setStats(statsData);
    } catch (err) {
      setError('Failed to load fraud data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (alertId, newStatus) => {
    try {
      await fraudService.updateAlertStatus(alertId, newStatus);
      fetchData();
      setShowDetails(false);
    } catch (err) {
      setError('Failed to update alert status');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  const severityColors = {
    Low: { bg: '#e8f5e9', color: '#2e7d32', icon: <CheckCircle /> },
    Medium: { bg: '#fff3e0', color: '#ed6c02', icon: <Warning /> },
    High: { bg: '#ffebee', color: '#c62828', icon: <WarningAmber /> },
    Critical: { bg: '#ffebee', color: '#d32f2f', icon: <Block /> },
  };

  const doughnutData = stats ? {
    labels: ['Pending', 'Reviewed', 'False Positive'],
    datasets: [{
      data: [stats.pending_review, stats.flagged_transactions - stats.pending_review, stats.pending_review ? 0 : 0],
      backgroundColor: ['#f59e0b', '#10b981', '#6c757d'],
    }],
  } : null;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><LinearProgress sx={{ width: 300 }} /></Box>;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Shield sx={{ color: '#6366f1' }} /> AI Fraud Detection Center
            </Typography>
            <Typography variant="body2" color="text.secondary">Real-time monitoring with 98.7% accuracy</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Analytics />}>Export Report</Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="caption">Total Transactions</Typography><Typography variant="h5">{stats.total_transactions}</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="caption">Flagged Transactions</Typography><Typography variant="h5" color="warning.main">{stats.flagged_transactions}</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="caption">Fraud Rate</Typography><Typography variant="h5">{stats.fraud_percentage?.toFixed(1)}%</Typography></CardContent></Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card><CardContent><Typography variant="caption">Pending Review</Typography><Typography variant="h5">{stats.pending_review}</Typography></CardContent></Card>
            </Grid>
          </Grid>
        )}

        {/* Alerts Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Recent Fraud Alerts</Typography>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                  <TableRow>
                    <TableCell>Severity</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.fraud_id}>
                      <TableCell>
                        <Chip
                          label={alert.alert_severity}
                          size="small"
                          icon={severityColors[alert.alert_severity]?.icon}
                          sx={{ bgcolor: severityColors[alert.alert_severity]?.bg, color: severityColors[alert.alert_severity]?.color }}
                        />
                      </TableCell>
                      <TableCell>{alert.fraud_type}</TableCell>
                      <TableCell>${alert.amount?.toLocaleString()}</TableCell>
                      <TableCell>{formatDate(alert.created_at)}</TableCell>
                      <TableCell>{(alert.confidence_score * 100).toFixed(1)}%</TableCell>
                      <TableCell><Chip label={alert.status} size="small" /></TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => { setSelectedAlert(alert); setShowDetails(true); }}>Review</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Alert Details Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Fraud Alert Details</DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption">Alert ID</Typography>
                  <Typography variant="body1">{selectedAlert.fraud_id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption">Severity</Typography>
                  <Chip label={selectedAlert.alert_severity} sx={{ bgcolor: severityColors[selectedAlert.alert_severity]?.bg, color: severityColors[selectedAlert.alert_severity]?.color }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption">Description</Typography>
                  <Typography variant="body2">{selectedAlert.description}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption">Transaction ID</Typography>
                  <Typography variant="body2">{selectedAlert.transaction_id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption">AI Confidence Score</Typography>
                  <Typography variant="body2">{(selectedAlert.confidence_score * 100).toFixed(1)}%</Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<Check />} onClick={() => handleUpdateStatus(selectedAlert.fraud_id, 'Reviewed')}>Mark as Reviewed</Button>
                <Button variant="outlined" startIcon={<Cancel />} onClick={() => handleUpdateStatus(selectedAlert.fraud_id, 'False Positive')}>False Positive</Button>
                
                {selectedAlert.transaction_id && (
                  <>
                    <Button variant="contained" color="success" onClick={async () => {
                        try {
                          await transactionService.updateTransactionStatus(selectedAlert.transaction_id, 'Success');
                          fetchData();
                          setShowDetails(false);
                          alert('Transaction Approved!');
                        } catch (e) {
                          alert('Failed to approve transaction.');
                        }
                    }}>Approve Transaction</Button>
                    <Button variant="contained" color="error" onClick={async () => {
                        try {
                          await transactionService.updateTransactionStatus(selectedAlert.transaction_id, 'Failed');
                          fetchData();
                          setShowDetails(false);
                          alert('Transaction Blocked!');
                        } catch (e) {
                          alert('Failed to block transaction.');
                        }
                    }}>Block Transaction</Button>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default FraudAlerts;