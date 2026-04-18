import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, 
  CardActionArea, Icon, Stack, Button, 
  Divider, TextField, Autocomplete, MenuItem, CircularProgress
} from '@mui/material';
import { 
  PhoneIphone, Router, ElectricBolt, WaterDrop, 
  Tv, Flight, School, ShoppingBag 
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import accountService from '../services/accountService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const billTypes = [
  { id: 'airtime', name: 'Airtime/Credit', icon: <PhoneIphone />, color: '#00d2ff', description: 'Top up your mobile line instantly' },
  { id: 'data', name: 'Data Subscriptions', icon: <Router />, color: '#9d50bb', description: 'Monthly and weekly data bundles' },
  { id: 'electricity', name: 'Electricity', icon: <ElectricBolt />, color: '#ffd700', description: 'Prepaid and Postpaid tokens' },
  { id: 'water', name: 'Water Bill', icon: <WaterDrop />, color: '#00f5a0', description: 'State water corporation payments' },
  { id: 'tv', name: 'Cable TV', icon: <Tv />, color: '#ff4b2b', description: 'DSTV, GOTV, and StarTimes' },
  { id: 'flights', name: 'Flights', icon: <Flight />, color: '#3a7bd5', description: 'Local and International bookings' },
  { id: 'tuition', name: 'Tuition', icon: <School />, color: '#6a11cb', description: 'University and Exam fees' },
  { id: 'shopping', name: 'Shopping', icon: <ShoppingBag />, color: '#f9d423', description: 'Online merchant payments' },
];

const providers = {
  default: ['MTN', 'Airtel', 'Glo', '9mobile'],
  electricity: ['IKEDC', 'EKEDC', 'AEDC', 'PHEDC'],
  tv: ['DSTV', 'GOTV', 'StarTimes'],
  water: ['LWC', 'SWC', 'KWC'],
  tuition: ['UNILAG', 'OAU', 'ABU', 'UI', 'Harvard', 'Oxford', 'Covenant University (Select or Type Any)'],
  flights: ['Air Peace', 'Arik Air', 'Emirates', 'Qatar Airways', 'Dana Air'],
  shopping: ['Amazon', 'Jumia', 'Konga', 'AliExpress']
};

const BillsPayment = () => {
  const navigate = useNavigate();
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({ provider: '', identifier: '', amount: '', extraInfo: '', source_account: '' });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data.accounts || []);
      } catch (err) {
        console.error("Failed to fetch accounts");
      }
    };
    fetchAccounts();
  }, []);

  const handleBillSelect = (bill) => {
    setSelectedBill(bill);
    setFormData({ provider: '', identifier: '', amount: '', extraInfo: '', source_account: '' });
  };

  const handlePayment = async () => {
    if (!formData.source_account || !formData.amount || !formData.provider) {
       toast.error("Please fill all required details");
       return;
    }
    setLoading(true);
    try {
      await api.post('/transactions/bill-payment', {
         from_account: formData.source_account,
         amount: parseFloat(formData.amount),
         description: `${selectedBill.name} Payment - ${formData.provider}`
      });
      toast.success("✅ Payment Successful!");
      setTimeout(() => navigate('/transactions'), 1800);
    } catch (err) {
      toast.error(err?.error || err?.message || "Payment failed. Check your balance.");
    } finally {
      setLoading(false);
    }
  };

  const currentProviders = providers[selectedBill?.id] || providers.default;

  return (
    <Box sx={{ py: 4 }}>
      <Toaster position="top-right" />
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
        Bills & Top-up
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Fast, secure, and automated payments for all your utility and lifestyle needs.
      </Typography>

      {!selectedBill ? (
        <Grid container spacing={3}>
          {billTypes.map((bill, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  sx={{ 
                     borderRadius: 4, 
                     background: 'rgba(255,255,255,0.03)', 
                     backdropFilter: 'blur(10px)',
                     border: '1px solid rgba(255,255,255,0.08)',
                     '&:hover': {
                       border: `1px solid ${bill.color}44`,
                       transform: 'translateY(-5px)',
                       transition: 'all 0.3s ease'
                     }
                  }}
                >
                  <CardActionArea sx={{ p: 3 }} onClick={() => handleBillSelect(bill)}>
                    <Stack spacing={2} alignItems="center" justifyContent="center">
                      <Box 
                        sx={{ 
                           width: 60, 
                           height: 60, 
                           borderRadius: '50%', 
                           display: 'flex', 
                           alignItems: 'center', 
                           justifyContent: 'center',
                           background: `linear-gradient(135deg, ${bill.color}22 0%, ${bill.color}11 100%)`,
                           color: bill.color
                        }}
                      >
                        {React.cloneElement(bill.icon, { sx: { fontSize: 32 } })}
                      </Box>
                      <Typography variant="h6" fontWeight={700} align="center">
                        {bill.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        {bill.description}
                      </Typography>
                    </Stack>
                  </CardActionArea>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Button 
              onClick={() => setSelectedBill(null)} 
              sx={{ mb: 3, fontWeight: 800, color: 'primary.main' }}
            >
              ← Back to All Bills
            </Button>
            
            <Card sx={{ p: 4, borderRadius: 5, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <Stack spacing={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: `${selectedBill.color}22`, color: selectedBill.color }}>
                    {selectedBill.icon}
                  </Box>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>{selectedBill.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{selectedBill.description}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ opacity: 0.1 }} />

                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.8 }}>Select Service Provider / Institution</Typography>
                    <Autocomplete
                      freeSolo
                      options={currentProviders}
                      disableClearable
                      value={formData.provider}
                      onChange={(event, newValue) => setFormData({ ...formData, provider: newValue })}
                      onInputChange={(event, newInputValue) => setFormData({ ...formData, provider: newInputValue })}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Type or select from list" 
                          InputProps={{ ...params.InputProps, type: 'search' }}
                        />
                      )}
                    />
                  </Box>

                  {selectedBill.id === 'electricity' ? (
                    <>
                      <TextField 
                        fullWidth 
                        label="Meter Number" 
                        placeholder="e.g. 12345678901"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      />
                      <TextField 
                         fullWidth 
                         label="Property Address" 
                         value={formData.extraInfo}
                         onChange={(e) => setFormData({ ...formData, extraInfo: e.target.value })}
                      />
                    </>
                  ) : selectedBill.id === 'tv' ? (
                    <TextField 
                      fullWidth 
                      label="Smart Card Number" 
                      placeholder="e.g. 1234-5678-9012"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    />
                  ) : selectedBill.id === 'tuition' ? (
                    <>
                      <TextField 
                        fullWidth 
                        label="Student ID / Matric Number" 
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      />
                      <TextField 
                         fullWidth 
                         label="Faculty / Department" 
                         value={formData.extraInfo}
                         onChange={(e) => setFormData({ ...formData, extraInfo: e.target.value })}
                      />
                    </>
                  ) : selectedBill.id === 'flights' ? (
                    <>
                      <TextField 
                        fullWidth 
                        label="Passport Number" 
                        placeholder="e.g. A1234567"
                        value={formData.identifier}
                        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                      />
                      <TextField 
                         fullWidth 
                         label="Flight Date / PNR" 
                         value={formData.extraInfo}
                         onChange={(e) => setFormData({ ...formData, extraInfo: e.target.value })}
                      />
                    </>
                  ) : selectedBill.id === 'shopping' ? (
                    <TextField 
                      fullWidth 
                      label="Merchant Order ID" 
                      placeholder="e.g. ORD-90145892"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    />
                  ) : (
                    <TextField 
                      fullWidth 
                      label="Phone / Account Number" 
                      placeholder="e.g. 08012345678"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    />
                  )}

                  <TextField 
                    fullWidth 
                    label="Amount" 
                    type="number"
                    InputProps={{ startAdornment: <Box sx={{ mr: 1, color: 'text.secondary' }}>₦</Box> }}
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />

                  <TextField 
                    select 
                    fullWidth 
                    label="Pay From Account" 
                    value={formData.source_account} 
                    onChange={(e) => setFormData({...formData, source_account: e.target.value})}
                    helperText={accounts.length === 0 ? "No active accounts found. Please open an account first." : ""}
                    error={accounts.length === 0}
                  >
                    {accounts.length > 0 ? accounts.map(acc => (
                      <MenuItem key={acc.account_id} value={acc.account_id}>
                        {acc.account_type} - {acc.account_number} (₦{acc.balance?.toLocaleString()})
                      </MenuItem>
                    )) : (
                      <MenuItem disabled value="">
                        No accounts available
                      </MenuItem>
                    )}
                  </TextField>

                  <Button 
                    fullWidth 
                    variant="contained" 
                    size="large"
                    onClick={handlePayment}
                    disabled={!formData.provider || !formData.amount || !formData.identifier || !formData.source_account || loading}
                    sx={{ py: 2, borderRadius: 4, fontWeight: 800, background: `linear-gradient(135deg, ${selectedBill.color} 0%, ${selectedBill.color}88 100%)` }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : `Pay ₦${formData.amount || '0'} Now`}
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Box>
        </motion.div>
      )}
    </Box>
  );
};

export default BillsPayment;
