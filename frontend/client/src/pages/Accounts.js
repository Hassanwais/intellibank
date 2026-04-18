import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Alert,
  LinearProgress,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Savings,
  Business,
  Add,
  Visibility,
  Send,
  Download,
  Settings,
  Lock,
  CheckCircle,
  Refresh,
  ArrowBack,
  ArrowForward,
  Search,
  CalendarToday,
  Warning,
  AccountBalanceWallet,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast, Toaster } from 'react-hot-toast';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import authService from '../services/authService';

const Accounts = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dialog states
  const [showTransfer, setShowTransfer] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Form states
  const [transferData, setTransferData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    description: '',
  });
  const [newAccountData, setNewAccountData] = useState({
    account_type: 'Checking',
    currency: 'NGN',
    initial_deposit: '',
  });
  const [editAccountData, setEditAccountData] = useState({
    daily_limit: '',
    status: '',
  });
  const [statementData, setStatementData] = useState({
    from_date: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
    to_date: format(new Date(), 'yyyy-MM-dd'),
    format: 'pdf',
  });
  
  // Pagination
  const [transactionPage, setTransactionPage] = useState(0);
  const [transactionLimit] = useState(10);
  const [transactionTotal, setTransactionTotal] = useState(0);
  
  // Filters
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ========== UTILITY FUNCTIONS ==========
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 2 }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountIcon = (type) => {
    switch(type) {
      case 'Savings': return <Savings sx={{ fontSize: 40 }} />;
      case 'Business': return <Business sx={{ fontSize: 40 }} />;
      case 'Current': return <AccountBalanceWallet sx={{ fontSize: 40 }} />;
      default: return <AccountBalance sx={{ fontSize: 40 }} />;
    }
  };

  const getAccountColor = (type) => {
    switch(type) {
      case 'Savings': return '#10b981';
      case 'Business': return '#8b5cf6';
      case 'Current': return '#f59e0b';
      default: return '#6366f1';
    }
  };

  // ========== FETCH FUNCTIONS ==========
  const fetchTransactions = async (accountId, page = 0) => {
    try {
      setTransactionLoading(true);
      const offset = page * transactionLimit;
      const data = await accountService.getAccountTransactions(accountId, transactionLimit, offset);
      setTransactions(data.transactions || []);
      setTransactionTotal(data.pagination?.total || 0);
      setTransactionPage(page);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setTransactionLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching accounts...');
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.error('No token found, redirecting to login');
        navigate('/login');
        return;
      }
      
      const data = await accountService.getAccounts();
      console.log('Accounts data:', data);
      
      if (data && data.accounts) {
        setAccounts(data.accounts);
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0]);
          fetchTransactions(data.accounts[0].account_id, 0);
        }
      } else {
        setError('No accounts found');
      }
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError(err.error || err.message || 'Failed to load accounts');
      toast.error(err.error || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLER FUNCTIONS ==========
  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    fetchTransactions(account.account_id, 0);
  };

  const handleCreateAccount = async () => {
    if (!newAccountData.account_type) {
      toast.error('Please select account type');
      return;
    }
    
    try {
      const result = await accountService.createAccount(newAccountData);
      toast.success('Account created successfully!');
      setShowNewAccount(false);
      setNewAccountData({ account_type: 'Checking', currency: 'NGN', initial_deposit: '' });
      fetchAccounts();
    } catch (err) {
      toast.error(err.error || 'Failed to create account');
      console.error('Create account error:', err);
    }
  };

  const handleUpdateAccount = async () => {
    try {
      await accountService.updateAccount(selectedAccount.account_id, editAccountData);
      toast.success('Account updated successfully!');
      setShowEditAccount(false);
      fetchAccounts();
    } catch (err) {
      toast.error(err.error || 'Failed to update account');
    }
  };

  const handleToggleAccountStatus = async () => {
    const newStatus = selectedAccount.status === 'Active' ? 'Frozen' : 'Active';
    try {
      await accountService.toggleAccountStatus(selectedAccount.account_id, newStatus);
      toast.success(`Account ${newStatus === 'Active' ? 'unfrozen' : 'frozen'} successfully`);
      fetchAccounts();
    } catch (err) {
      toast.error(err.error || 'Failed to update account status');
    }
  };

  const handleTransfer = async () => {
    if (!transferData.to_account || !transferData.amount || transferData.amount <= 0) {
      toast.error('Please enter valid recipient and amount');
      return;
    }

    try {
      await transactionService.transfer({
        from_account: selectedAccount.account_id,
        to_account: transferData.to_account,
        amount: parseFloat(transferData.amount),
        description: transferData.description
      });
      toast.success('Transfer completed successfully!');
      setTransferData({ from_account: '', to_account: '', amount: '', description: '' });
      setShowTransfer(false);
      fetchTransactions(selectedAccount.account_id, transactionPage);
      fetchAccounts();
    } catch (err) {
      toast.error(err.error || 'Transfer failed');
    }
  };

  const handleGenerateStatement = async () => {
    try {
      const blob = await accountService.generateStatement(
        selectedAccount.account_id,
        statementData.from_date,
        statementData.to_date,
        statementData.format
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement_${selectedAccount.account_number}_${statementData.from_date}_to_${statementData.to_date}.${statementData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Statement generated successfully!');
      setShowStatement(false);
    } catch (err) {
      toast.error(err.error || 'Failed to generate statement');
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.transaction_type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    if (searchQuery && !tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !tx.transaction_type?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // ========== USE EFFECT ==========
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    fetchAccounts();
  }, [navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LinearProgress sx={{ width: 300 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Toaster position="top-right" />
      
      <Box sx={{ py: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>My Accounts</Typography>
            <Typography variant="body2" color="text.secondary">Manage and monitor all your banking accounts</Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={() => setShowNewAccount(true)}
            sx={{ background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)' }}
          >
            Open New Account
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

        {/* Accounts Grid */}
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Your Accounts</Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {accounts.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">No accounts found. Click "Open New Account" to get started.</Typography>
              </Card>
            </Grid>
          ) : (
            accounts.map((account) => (
              <Grid item xs={12} md={6} lg={4} key={account.account_id}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{ cursor: 'pointer' }}
                >
                  <Card 
                    sx={{ 
                      border: selectedAccount?.account_id === account.account_id ? '2px solid #6366f1' : '1px solid #e2e8f0',
                      transition: 'all 0.2s',
                      position: 'relative',
                      overflow: 'visible'
                    }}
                    onClick={() => handleAccountSelect(account)}
                  >
                    {account.status === 'Frozen' && (
                      <Chip 
                        label="Frozen" 
                        size="small" 
                        icon={<Lock />} 
                        sx={{ position: 'absolute', top: -10, right: 20, bgcolor: '#ef4444', color: 'white' }} 
                      />
                    )}
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: `${getAccountColor(account.account_type)}15`, color: getAccountColor(account.account_type), width: 56, height: 56 }}>
                            {getAccountIcon(account.account_type)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={600}>{account.account_type}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {account.account_number}
                            </Typography>
                          </Box>
                        </Box>
                        <Chip 
                          label={account.status} 
                          size="small" 
                          sx={{ 
                            bgcolor: account.status === 'Active' ? '#e8f5e9' : '#ffebee',
                            color: account.status === 'Active' ? '#2e7d32' : '#c62828'
                          }} 
                        />
                      </Box>
                      
                      <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
                        {formatCurrency(account.balance)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleAccountSelect(account); }}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Transfer">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedAccount(account); setShowTransfer(true); }}>
                            <Send />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Statement">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedAccount(account); setShowStatement(true); }}>
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Account Settings">
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); setSelectedAccount(account); setEditAccountData({ daily_limit: account.daily_limit, status: account.status }); setShowEditAccount(true); }}>
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))
          )}
        </Grid>

        {/* Selected Account Details */}
        {selectedAccount && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Account Details: {selectedAccount.account_type}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={selectedAccount.status === 'Active' ? <Lock /> : <CheckCircle />}
                    onClick={handleToggleAccountStatus}
                    size="small"
                  >
                    {selectedAccount.status === 'Active' ? 'Freeze Account' : 'Unfreeze Account'}
                  </Button>
                  <Button variant="outlined" startIcon={<Refresh />} onClick={() => fetchTransactions(selectedAccount.account_id, transactionPage)} size="small">
                    Refresh
                  </Button>
                </Box>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1" fontWeight={500}>{selectedAccount.account_number}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Account Type</Typography>
                  <Typography variant="body1" fontWeight={500}>{selectedAccount.account_type}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Currency</Typography>
                  <Typography variant="body1" fontWeight={500}>{selectedAccount.currency}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Daily Limit</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatCurrency(selectedAccount.daily_limit)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Opened Date</Typography>
                  <Typography variant="body1" fontWeight={500}>{formatDate(selectedAccount.opened_date)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={selectedAccount.status} size="small" sx={{ mt: 0.5 }} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Transactions Section */}
        {selectedAccount && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Transaction History - {selectedAccount.account_type}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Type</InputLabel>
                    <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                      <MenuItem value="all">All Types</MenuItem>
                      <MenuItem value="Transfer">Transfer</MenuItem>
                      <MenuItem value="Deposit">Deposit</MenuItem>
                      <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                      <MenuItem value="Payment">Payment</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Success">Success</MenuItem>
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {transactionLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <LinearProgress sx={{ width: 200 }} />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                          <TableCell>Date & Time</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Description</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Fraud Flag</TableCell>
                          <TableCell align="center">Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredTransactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} align="center">
                              <Typography color="text.secondary" sx={{ py: 4 }}>No transactions found</Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTransactions.map((tx) => (
                            <TableRow key={tx.transaction_id} hover>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarToday sx={{ fontSize: 12, color: 'text.secondary' }} />
                                  <Typography variant="body2">{formatDate(tx.created_at)}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={tx.transaction_type} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: tx.transaction_type === 'Deposit' ? '#e8f5e9' : '#e3f2fd',
                                    color: tx.transaction_type === 'Deposit' ? '#2e7d32' : '#1976d2'
                                  }} 
                                />
                              </TableCell>
                              <TableCell>{tx.description || tx.transaction_type}</TableCell>
                              <TableCell align="right">
                                <Typography sx={{ 
                                  color: tx.direction === 'incoming' ? '#10b981' : '#ef4444', 
                                  fontWeight: 500 
                                }}>
                                  {tx.direction === 'incoming' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={tx.status} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: tx.status === 'Success' ? '#e8f5e9' : tx.status === 'Pending' ? '#fff3e0' : '#ffebee',
                                    color: tx.status === 'Success' ? '#2e7d32' : tx.status === 'Pending' ? '#ed6c02' : '#c62828'
                                  }} 
                                />
                              </TableCell>
                              <TableCell>
                                {tx.fraud_flag ? (
                                  <Tooltip title="Flagged by AI">
                                    <Chip label="Flagged" size="small" icon={<Warning sx={{ fontSize: 12 }} />} color="warning" />
                                  </Tooltip>
                                ) : (
                                  <Chip label="Safe" size="small" icon={<CheckCircle sx={{ fontSize: 12 }} />} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                )}
                              </TableCell>
                              <TableCell align="center">
                                <IconButton 
                                  size="small" 
                                  onClick={() => { setSelectedTransaction(tx); setShowTransactionDetails(true); }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {transactionTotal > transactionLimit && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                      <Button 
                        size="small" 
                        startIcon={<ArrowBack />} 
                        disabled={transactionPage === 0} 
                        onClick={() => fetchTransactions(selectedAccount.account_id, transactionPage - 1)}
                      >
                        Previous
                      </Button>
                      <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                        Page {transactionPage + 1} of {Math.ceil(transactionTotal / transactionLimit)}
                      </Typography>
                      <Button 
                        size="small" 
                        endIcon={<ArrowForward />} 
                        disabled={(transactionPage + 1) * transactionLimit >= transactionTotal} 
                        onClick={() => fetchTransactions(selectedAccount.account_id, transactionPage + 1)}
                      >
                        Next
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* New Account Dialog */}
      <Dialog open={showNewAccount} onClose={() => setShowNewAccount(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Open New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Account Type</InputLabel>
              <Select 
                value={newAccountData.account_type} 
                onChange={(e) => setNewAccountData({ ...newAccountData, account_type: e.target.value })}
              >
                <MenuItem value="Checking">Checking Account</MenuItem>
                <MenuItem value="Current">Current Account</MenuItem>
                <MenuItem value="Savings">Savings Account</MenuItem>
                <MenuItem value="Business">Business Account</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Currency</InputLabel>
              <Select 
                value={newAccountData.currency} 
                onChange={(e) => setNewAccountData({ ...newAccountData, currency: e.target.value })}
              >
                <MenuItem value="NGN">NGN - Nigerian Naira</MenuItem>
                <MenuItem value="INR">INR - Indian Rupee</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Initial Deposit (Optional)"
              type="number"
              value={newAccountData.initial_deposit}
              onChange={(e) => setNewAccountData({ ...newAccountData, initial_deposit: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewAccount(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateAccount}>Open Account</Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransfer} onClose={() => setShowTransfer(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Money</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>From Account</InputLabel>
              <Select 
                value={selectedAccount?.account_id || ''} 
                onChange={(e) => setTransferData({ ...transferData, from_account: e.target.value })}
              >
                {accounts.map(acc => (
                  <MenuItem key={acc.account_id} value={acc.account_id}>
                    {acc.account_type} - {formatCurrency(acc.balance)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Recipient Account Number"
              value={transferData.to_account}
              onChange={(e) => setTransferData({ ...transferData, to_account: e.target.value })}
              sx={{ mb: 2 }}
              placeholder="Enter account number"
            />
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
            <TextField
              fullWidth
              label="Description (Optional)"
              value={transferData.description}
              onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
              placeholder="What's this for?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransfer(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleTransfer}>Send Money</Button>
        </DialogActions>
      </Dialog>

      {/* Statement Dialog */}
      <Dialog open={showStatement} onClose={() => setShowStatement(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Statement</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={statementData.from_date}
              onChange={(e) => setStatementData({ ...statementData, from_date: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={statementData.to_date}
              onChange={(e) => setStatementData({ ...statementData, to_date: e.target.value })}
              sx={{ mb: 2 }}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Format</InputLabel>
              <Select 
                value={statementData.format} 
                onChange={(e) => setStatementData({ ...statementData, format: e.target.value })}
              >
                <MenuItem value="pdf">PDF Document</MenuItem>
                <MenuItem value="csv">CSV Spreadsheet</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatement(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Download />} onClick={handleGenerateStatement}>Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditAccount} onClose={() => setShowEditAccount(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Account Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Daily Transaction Limit"
              type="number"
              value={editAccountData.daily_limit}
              onChange={(e) => setEditAccountData({ ...editAccountData, daily_limit: e.target.value })}
              sx={{ mb: 2 }}
              InputProps={{ startAdornment: <InputAdornment position="start">₦</InputAdornment> }}
            />
            <FormControl fullWidth>
              <InputLabel>Account Status</InputLabel>
              <Select 
                value={editAccountData.status} 
                onChange={(e) => setEditAccountData({ ...editAccountData, status: e.target.value })}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Frozen">Frozen</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditAccount(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateAccount}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onClose={() => setShowTransactionDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>Transaction Details</DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body1">{selectedTransaction.transaction_id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Reference Number</Typography>
                  <Typography variant="body1">{selectedTransaction.reference_number || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Date & Time</Typography>
                  <Typography variant="body1">{formatDate(selectedTransaction.created_at)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="h6" sx={{ color: selectedTransaction.direction === 'incoming' ? '#10b981' : '#ef4444' }}>
                    {selectedTransaction.direction === 'incoming' ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Chip label={selectedTransaction.transaction_type} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip label={selectedTransaction.status} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Description</Typography>
                  <Typography variant="body1">{selectedTransaction.description || 'No description provided'}</Typography>
                </Grid>
                {selectedTransaction.fraud_flag && (
                  <Grid item xs={12}>
                    <Alert severity="warning" icon={<Warning />}>
                      This transaction was flagged by AI fraud detection with {(selectedTransaction.fraud_score * 100).toFixed(1)}% confidence.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransactionDetails(false)}>Close</Button>
          <Button variant="contained" onClick={() => setShowTransactionDetails(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Accounts;