import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardActionArea, Grid, 
  Paper, Button, Chip, TextField, InputAdornment, Alert, LinearProgress, 
  Stack, useTheme, MenuItem
} from '@mui/material';
import {
  TrendingUp, Send, History, Security, 
  Shield, AutoAwesome, Savings, VerifiedUser
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import authService from '../services/authService';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import fraudService from '../services/fraudService';
import toast, { Toaster } from 'react-hot-toast';
import AccountCard from '../components/AccountCard';
import FraudAlertCard from '../components/FraudAlertCard';
import TransactionList from '../components/TransactionList';

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State variables
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transferData, setTransferData] = useState({ from_account: '', to: '', amount: '', description: '' });
  const [budget, setBudget] = useState({ monthly: 500000, spent: 0 });
  const [financialTips, setFinancialTips] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData, fraudAlertsData] = await Promise.all([
        accountService.getAccounts().catch(() => ({ accounts: [] })),
        transactionService.getTransactions().catch(() => ({ transactions: [] })),
        fraudService.getFraudAlerts().catch(() => ({ alerts: [] })),
      ]);
      
      const accList = accountsData.accounts || [];
      const txList = transactionsData.transactions || [];
      setAccounts(accList);
      if (accList.length > 0 && !transferData.from_account) {
        setTransferData(prev => ({ ...prev, from_account: accList[0]?.account_id || '' }));
      }
      setTransactions(txList);
      setFraudAlerts(fraudAlertsData.alerts || []);
      
      const monthlyTotal = txList
        .filter(t => t.direction === 'outgoing' && new Date(t.created_at).getMonth() === new Date().getMonth())
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      setBudget(prev => ({ ...prev, spent: monthlyTotal }));
      
      generateFinancialTips(monthlyTotal);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to sync with secure banking node');
    } finally {
      setLoading(false);
    }
  };

  const generateFinancialTips = (monthlySpent) => {
    const tips = [
      { icon: <Savings />, text: 'You saved ₦12,400 more than last month! Keep it up.', color: '#10b981' },
      { icon: <Security />, text: 'Enable AI Shield for enhanced fraud protection during holiday spending.', color: '#6366f1' },
      { icon: <TrendingUp />, text: 'Your mutual fund is up 4.2% this week.', color: '#10b981' }
    ];
    setFinancialTips(tips);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  const monthlySpent = budget.spent;
  const monthlyIncome = transactions
    .filter(t => t.direction === 'incoming' && new Date(t.created_at).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpent) / monthlyIncome * 100).toFixed(1) : 0;

  const handleQuickTransfer = async () => {
    if (!transferData.to || !transferData.amount || transferData.amount <= 0) {
      toast.error('Please enter valid recipient and amount');
      return;
    }
    if (accounts.length === 0) {
      toast.error('No active account found to transfer from.');
      return;
    }
    
    try {
      await transactionService.transfer({
        from_account: transferData.from_account || accounts[0]?.account_id,
        to_account: transferData.to,
        amount: parseFloat(transferData.amount),
        description: transferData.description || 'Quick transfer',
      });
      toast.success('Funds transferred securely!');
      setTransferData({ from_account: transferData.from_account, to: '', amount: '', description: '' });
      fetchData();
    } catch (error) {
      toast.error(error.error || 'Identity verification required for this amount');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      { label: 'Income', data: [12000, 9000, 15000, 8000, 20000, 5000, 3000], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
      { label: 'Spending', data: [8000, 7000, 11000, 6000, 15000, 4000, 2000], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
    ],
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 4 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>Synchronizing secure vault data...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Toaster position="top-right" />
      
      {/* Header Info */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
            Hello, {user?.full_name?.split(' ')[0] || 'Ahmad'}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Shield sx={{ fontSize: 18, color: 'success.main' }} />
            <Typography variant="body2" color="text.secondary">
              AI-Shield is active and monitoring {accounts.length} linked accounts
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<History />} 
            onClick={() => navigate('/transactions')}
            sx={{ border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
          >
            Statements
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Send />} 
            onClick={() => navigate('/transfer')}
          >
            Global Transfer
          </Button>
        </Box>
      </Box>

      {/* Main Stats and Accounts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <motion.div {...fadeInUp}>
            <Paper 
              sx={{ 
                p: { xs: 3, md: 5 }, mb: 4, 
                background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(58, 123, 213, 0.1) 100%)',
                backdropFilter: 'blur(10px)',
                borderRadius: 5,
                border: '1px solid rgba(0, 210, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,210,255,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }} />
              
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 2 }}>Total Liquid Balance</Typography>
                  <Typography variant="h1" sx={{ my: 1, letterSpacing: '-0.02em' }}>{formatCurrency(totalBalance)}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                    <Chip 
                      label="+₦24,500 this week" 
                      size="small" 
                      sx={{ bgcolor: 'rgba(0,245,160,0.1)', color: 'success.main', fontWeight: 800 }} 
                    />
                    <Chip 
                      label="Trust Score: 981" 
                      size="small" 
                      icon={<Shield sx={{ color: 'inherit !important', fontSize: 16 }} />}
                      sx={{ bgcolor: 'rgba(0,210,255,0.1)', color: 'primary.main', fontWeight: 800 }} 
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                     <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 2, fontWeight: 700 }}>Monthly Savings Progress</Typography>
                     <LinearProgress 
                        variant="determinate" 
                        value={savingsRate > 0 ? savingsRate : 15} 
                        sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { backgroundColor: 'primary.main' } }} 
                     />
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>{savingsRate}% Saved</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Target: 25%</Typography>
                     </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </motion.div>

          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Linked Accounts</Typography>
          <Grid container spacing={2}>
            {accounts.map((acc, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <AccountCard account={acc} />
              </Grid>
            ))}
            {accounts.length === 0 && (
              <Grid item xs={12}>
                <Alert severity="info" sx={{ borderRadius: 4 }}>No linked accounts found. Please contact support to link your primary account.</Alert>
              </Grid>
            )}
          </Grid>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 5, mb: 3, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Quick Money Move</Typography>
              <TextField 
                select
                fullWidth 
                label="From Account" 
                variant="outlined" 
                value={transferData.from_account}
                onChange={(e) => setTransferData({ ...transferData, from_account: e.target.value })}
                sx={{ mb: 2 }} 
              >
                {accounts.map(acc => (
                  <MenuItem key={acc.account_id} value={acc.account_id}>
                    {acc.account_type} (...{acc.account_number.slice(-4)})
                  </MenuItem>
                ))}
              </TextField>
              <TextField 
                fullWidth 
                label="Account Number" 
                variant="outlined" 
                value={transferData.to}
                onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
                sx={{ mb: 2 }} 
              />
              <TextField 
                fullWidth 
                label="Amount" 
                type="number" 
                variant="outlined" 
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
                sx={{ mb: 3 }} 
              />
              <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                onClick={handleQuickTransfer}
                sx={{ py: 1.8, borderRadius: 3, fontWeight: 800, background: 'linear-gradient(135deg, #9d50bb 0%, #6e3883 100%)' }}
              >
                Send Securely
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ borderRadius: 5, background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            <CardActionArea onClick={() => navigate('/ai-insights')}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                   <AutoAwesome sx={{ color: '#f59e0b' }} />
                   <Typography variant="h6" fontWeight={800} color="#f59e0b">AI Insights</Typography>
                </Box>
                <Stack spacing={2}>
                   {financialTips.map((tip, idx) => (
                     <Box key={idx} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 3, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{tip.text}</Typography>
                     </Box>
                   ))}
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>

      {/* Activity and Alerts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 5, mb: 4, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800}>Recent Activity</Typography>
                <Button size="small" variant="text" onClick={() => navigate('/transactions')} sx={{ fontWeight: 700 }}>
                  View Full History
                </Button>
              </Box>
              <TransactionList transactions={transactions.slice(0, 5)} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={800}>Security Watch</Typography>
            <Chip 
              label={`${fraudAlerts.filter(a => a.status === 'Pending').length} Pending`} 
              size="small" 
              color="warning" 
              sx={{ fontWeight: 700 }} 
            />
          </Box>
          
          {fraudAlerts.length > 0 ? (
            <Stack spacing={2}>
              {fraudAlerts.map((alert, idx) => (
                <FraudAlertCard key={idx} alert={alert} onRefresh={fetchData} />
              ))}
            </Stack>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'rgba(0, 245, 160, 0.05)', borderRadius: 5, border: '1px solid rgba(0, 245, 160, 0.2)' }}>
              <VerifiedUser sx={{ fontSize: 48, color: 'success.main', mb: 1.5, opacity: 0.8 }} />
              <Typography variant="subtitle2" fontWeight={800} color="success.main">All Systems Secure</Typography>
              <Typography variant="caption" color="text.secondary">No suspicious activity detected in the last 24 hours.</Typography>
            </Box>
          )}
          
          <Button 
            fullWidth 
            variant="text" 
            startIcon={<Security />} 
            onClick={() => navigate('/settings')}
            sx={{ mt: 2, color: 'text.secondary', fontWeight: 600 }}
          >
            Configure Alert Credentials
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};


export default Dashboard;