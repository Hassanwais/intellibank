import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip, Stack } from '@mui/material';
import { ContentCopy, AccountBalanceWallet, SwapHoriz, TrendingUp } from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AccountCard = ({ account }) => {
  const { account_number, account_type, balance, currency = 'NGN' } = account;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(account_number);
    toast.success('Account number copied!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card 
        sx={{ 
          borderRadius: 5, 
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            right: 0, 
            width: 100, 
            height: 100, 
            background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)',
            zIndex: 0
          }} 
        />
        
        <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  p: 1, 
                  borderRadius: 2.5, 
                  bgcolor: '#eff6ff', 
                  color: '#2563eb',
                  display: 'flex'
                }}
              >
                <AccountBalanceWallet fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#1e293b">
                  {account_type} Account
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
            </Box>
            <Chip 
              label="Primary" 
              size="small" 
              sx={{ bgcolor: '#ecfdf5', color: '#059669', fontWeight: 700, fontSize: '0.65rem' }} 
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" fontWeight={800} sx={{ color: '#1e293b' }}>
              {formatCurrency(balance)}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
              <TrendingUp sx={{ color: '#10b981', fontSize: 14 }} />
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                +2.4% from last month
              </Typography>
            </Stack>
          </Box>

          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 1.5,
              bgcolor: '#f1f5f9',
              borderRadius: 3
            }}
          >
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, fontSize: '0.6rem', textTransform: 'uppercase' }}>
                Account Number
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#334155', letterSpacing: 1 }}>
                {account_number}
              </Typography>
            </Box>
            <IconButton size="small" onClick={copyToClipboard} sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e2e8f0' } }}>
              <ContentCopy fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AccountCard;
