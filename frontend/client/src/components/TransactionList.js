import React from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Paper, Typography, Box, Chip, Avatar, IconButton, Tooltip 
} from '@mui/material';
import { 
  TrendingUp, TrendingDown, Info, MoreVert, 
  Receipt, Payment, Send, PhoneAndroid 
} from '@mui/icons-material';

const TransactionList = ({ transactions }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  const getIcon = (type, direction) => {
    switch (type) {
      case 'Transfer': return <Send fontSize="small" />;
      case 'Payment': return <Payment fontSize="small" />;
      case 'Airtime': return <PhoneAndroid fontSize="small" />;
      default: return direction === 'incoming' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Success':
      case 'Completed':
        return <Chip label="Success" size="small" sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'Pending':
        return <Chip label="Pending" size="small" sx={{ bgcolor: '#fff7ed', color: '#c2410c', fontWeight: 700, fontSize: '0.7rem' }} />;
      case 'Failed':
      case 'Blocked':
        return <Chip label={status} size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.7rem' }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />;
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
        <Receipt sx={{ fontSize: 48, color: '#94a3b8', mb: 2, opacity: 0.5 }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          No recent transactions to display.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: 'none', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b' }}>Transaction</TableCell>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b' }}>Category</TableCell>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b' }} align="right">Amount</TableCell>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b' }}>Status</TableCell>
            <TableCell sx={{ bgcolor: '#f8fafc', fontWeight: 700, color: '#64748b' }} align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.transaction_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: tx.direction === 'incoming' ? '#f0fdf4' : '#f8fafc', 
                      color: tx.direction === 'incoming' ? '#10b981' : '#64748b',
                      width: 40,
                      height: 40
                    }}
                  >
                    {getIcon(tx.transaction_type, tx.direction)}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={700} color="#1e293b">
                      {tx.description || tx.transaction_type}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(tx.created_at).toLocaleDateString()} at {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  {tx.transaction_type || 'General'}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography 
                  variant="body2" 
                  fontWeight={800} 
                  color={tx.direction === 'incoming' ? '#10b981' : '#1e293b'}
                >
                  {tx.direction === 'incoming' ? '+' : '-'}{formatCurrency(tx.amount)}
                </Typography>
              </TableCell>
              <TableCell>
                {getStatusChip(tx.status)}
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Details">
                  <IconButton size="small">
                    <Info fontSize="small" sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TransactionList;
