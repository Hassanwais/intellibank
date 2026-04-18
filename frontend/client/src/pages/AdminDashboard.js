import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Grid, Card, CardContent,
  CircularProgress, Alert, Button, IconButton, Tooltip, Avatar
} from '@mui/material';
import {
  People, Receipt, Security, ArrowForward, TrendingUp
} from '@mui/icons-material';
import adminService from '../services/adminService';
import authService from '../services/authService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only allow Admin users
    const user = authService.getCurrentUser();
    if (!user || user.user_role !== 'Admin') {
      navigate('/dashboard');
      return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.message || err.error || 'Failed to load system stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ maxWidth: 'xl', mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Admin Control Center</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          System overview and actionable security intelligence.
        </Typography>

        <Grid container spacing={4}>
          {/* Total Users Stat */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 64, height: 64, mr: 3 }}>
                  <People sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats?.total_users || 0}</Typography>
                  <Typography variant="body1" color="text.secondary">Total Platform Users</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Transactions Stat */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 64, height: 64, mr: 3 }}>
                  <Receipt sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">{stats?.total_transactions || 0}</Typography>
                  <Typography variant="body1" color="text.secondary">Total Transactions Processed</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Alerts Stat */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 3, border: stats?.pending_alerts > 0 ? '2px solid #ef4444' : 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'error.light', color: 'error.main', width: 64, height: 64, mr: 3 }}>
                  <Security sx={{ fontSize: 32 }} />
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" fontWeight="bold" color="error.main">{stats?.pending_alerts || 0}</Typography>
                  <Typography variant="body1" color="text.secondary">Pending Fraud Alerts</Typography>
                </Box>
                <Tooltip title="Review Alerts">
                  <IconButton color="error" onClick={() => navigate('/fraud-alerts')} sx={{ bgcolor: 'error.50' }}>
                    <ArrowForward />
                  </IconButton>
                </Tooltip>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#1e293b', color: 'white' }}>
               <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                 <TrendingUp sx={{ fontSize: 40, mr: 3, color: '#38bdf8' }} />
                 <Box>
                   <Typography variant="h6" fontWeight="bold">Intelligent Security Operations</Typography>
                   <Typography variant="body2" sx={{ opacity: 0.8 }}>
                     The real-time ML pipeline is actively analyzing {stats?.total_transactions || 0} transactions for fraudulent behavioral patterns.
                   </Typography>
                 </Box>
               </Box>
               <Button variant="contained" color="primary" sx={{ mr: 2 }} onClick={() => navigate('/fraud-alerts')}>
                 Go to Fraud Queue
               </Button>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
