import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactions } from '../store/transactionSlice';
import {
  Box, Typography, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip,
  TextField, MenuItem, Select, FormControl, InputLabel, InputAdornment,
  TablePagination, Paper, CircularProgress, Alert
} from '@mui/material';
import { Search, Warning, CheckCircle } from '@mui/icons-material';

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, isLoading, error } = useSelector((state) => state.transactions);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.transaction_type !== filterType) return false;
    if (filterStatus !== 'all' && tx.status !== filterStatus) return false;
    if (searchQuery && !tx.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tx.transaction_type?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>Transactions</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          View, monitor, and filter your financial history across all accounts
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{typeof error === 'string' ? error : error.message || 'Failed to fetch transactions'}</Alert>}

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <CardContent>
            {/* Filter Section */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <TextField
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Type</InputLabel>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="Transfer">Transfer</MenuItem>
                  <MenuItem value="Deposit">Deposit</MenuItem>
                  <MenuItem value="Withdrawal">Withdrawal</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Success">Success</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Table Section */}
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box>
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                      <TableRow>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Transaction Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Security Alert</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTransactions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No transactions found matching the criteria</Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((tx) => (
                          <TableRow key={tx.transaction_id} hover>
                            <TableCell>{formatDate(tx.created_at)}</TableCell>
                            <TableCell>
                              <Chip 
                                label={tx.transaction_type} 
                                size="small" 
                                color={tx.transaction_type === 'Deposit' ? 'success' : tx.transaction_type === 'Withdrawal' ? 'error' : 'primary'}
                                variant="outlined" 
                              />
                            </TableCell>
                            <TableCell>{tx.description || '-'}</TableCell>
                            <TableCell align="right">
                              <Typography fontWeight={600} color={tx.direction === 'incoming' || tx.transaction_type === 'Deposit' ? 'success.main' : 'error.main'}>
                                {tx.direction === 'incoming' || tx.transaction_type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={tx.status} 
                                size="small" 
                                color={tx.status === 'Success' ? 'success' : tx.status === 'Pending' ? 'warning' : 'error'}
                              />
                            </TableCell>
                            <TableCell>
                              {tx.fraud_flag ? (
                                <Chip label="Flagged" size="small" icon={<Warning sx={{ fontSize: 16 }} />} color="warning" />
                              ) : (
                                <Chip label="Safe" size="small" icon={<CheckCircle sx={{ fontSize: 16 }} />} color="success" variant="outlined" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredTransactions.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Transactions;
