import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Stack,
  Chip, TextField, MenuItem, Dialog, DialogTitle, DialogContent,
  DialogActions, Divider, Alert, LinearProgress
} from '@mui/material';
import { CurrencyBitcoin, TrendingUp, TrendingDown, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const coins = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', price: 103420000, change: 2.4, color: '#f59e0b', icon: '₿' },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', price: 5890000, change: -1.2, color: '#6366f1', icon: 'Ξ' },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', price: 1020000, change: 0.8, color: '#f3ba2f', icon: 'BNB' },
  { id: 'sol', name: 'Solana', symbol: 'SOL', price: 278000, change: 5.1, color: '#9945ff', icon: '◎' },
  { id: 'usdt', name: 'Tether', symbol: 'USDT', price: 1650, change: 0.0, color: '#26a17b', icon: '₮' },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', price: 3200, change: -0.5, color: '#00aae4', icon: 'X' },
];

const Cryptocurrency = () => {
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState('buy');
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [amount, setAmount] = useState('');
  const [done, setDone] = useState(false);

  const handleTrade = (coin, type) => {
    setSelectedCoin(coin);
    setTradeType(type);
    setAmount('');
    setDone(false);
    setOpen(true);
  };

  const cryptoAmount = selectedCoin && amount ? (parseFloat(amount) / selectedCoin.price).toFixed(8) : '0';

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>Cryptocurrency</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Buy, sell, and track top digital assets — powered by IntelliBank Crypto Desk.
      </Typography>

      {/* Portfolio Summary */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { label: 'Portfolio Value', value: '₦0.00', sub: 'Start trading to see your portfolio' },
          { label: '24h Change', value: '+₦0.00', sub: '0.00% today' },
          { label: 'Total Assets', value: '0 coins', sub: 'No holdings yet' },
        ].map((s, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: i === 0 ? '#0f172a' : 'rgba(255,255,255,0.02)', p: 1 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Live Market Table */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Live Market Prices (₦)</Typography>
      <Grid container spacing={2}>
        {coins.map((coin, i) => (
          <Grid item xs={12} sm={6} md={4} key={coin.id}>
            <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <Card sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)', p: 1 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: `${coin.color}22`, color: coin.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>
                        {coin.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{coin.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{coin.symbol}</Typography>
                      </Box>
                    </Stack>
                    <Chip
                      icon={coin.change >= 0 ? <TrendingUp /> : <TrendingDown />}
                      label={`${coin.change >= 0 ? '+' : ''}${coin.change}%`}
                      size="small"
                      color={coin.change >= 0 ? 'success' : 'error'}
                    />
                  </Stack>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>
                    ₦{coin.price.toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" color="success" fullWidth onClick={() => handleTrade(coin, 'buy')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                      Buy
                    </Button>
                    <Button size="small" variant="outlined" color="error" fullWidth onClick={() => handleTrade(coin, 'sell')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                      Sell
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Trade Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: `${selectedCoin?.color}22`, color: selectedCoin?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {selectedCoin?.icon}
            </Box>
            <Typography variant="h6" fontWeight={700}>
              {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedCoin?.name}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {!done ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Alert severity={tradeType === 'buy' ? 'info' : 'warning'} sx={{ borderRadius: 2 }}>
                Current Price: ₦{selectedCoin?.price.toLocaleString()} per {selectedCoin?.symbol}
              </Alert>
              <TextField select fullWidth label="Pay From Account" defaultValue="savings">
                <MenuItem value="savings">Savings Account (₦500,000)</MenuItem>
                <MenuItem value="checking">Checking Account (₦250,000)</MenuItem>
              </TextField>
              <TextField
                fullWidth
                label={`Amount in ₦ to ${tradeType}`}
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                helperText={amount ? `≈ ${cryptoAmount} ${selectedCoin?.symbol}` : 'Enter amount in Naira'}
              />
              <Divider sx={{ opacity: 0.1 }} />
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Fee (0.5%)</Typography>
                <Typography fontWeight={700}>₦{amount ? (parseFloat(amount) * 0.005).toLocaleString('en-NG', { maximumFractionDigits: 2 }) : '0.00'}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">You receive</Typography>
                <Typography fontWeight={700} color="success.main">{cryptoAmount} {selectedCoin?.symbol}</Typography>
              </Stack>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 72, color: '#10b981', mb: 2 }} />
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Trade Successful!</Typography>
              <Typography color="text.secondary">
                {tradeType === 'buy' ? 'Purchased' : 'Sold'} {cryptoAmount} {selectedCoin?.symbol} for ₦{parseFloat(amount || 0).toLocaleString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {!done ? (
            <>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                variant="contained"
                color={tradeType === 'buy' ? 'success' : 'error'}
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setDone(true)}
              >
                Confirm {tradeType === 'buy' ? 'Purchase' : 'Sale'}
              </Button>
            </>
          ) : (
            <Button variant="contained" fullWidth onClick={() => setOpen(false)}>Done</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Cryptocurrency;
