import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Stack, Chip,
  Stepper, Step, StepLabel, TextField, MenuItem, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Alert
} from '@mui/material';
import { TrendingUp, AccountBalanceWallet, CheckCircle, ShowChart } from '@mui/icons-material';
import { motion } from 'framer-motion';

const plans = [
  { id: 'treasury', name: 'Treasury Bills', risk: 'Low', return: '12–14%', min: '50,000', period: '91 days' },
  { id: 'mutual', name: 'Mutual Fund', risk: 'Medium', return: '18–22%', min: '10,000', period: 'Open-ended' },
  { id: 'equities', name: 'Stock Portfolio', risk: 'High', return: '25–40%', min: '100,000', period: '1 year+' },
  { id: 'fixed', name: 'Fixed Deposit', risk: 'Low', return: '10–13%', min: '100,000', period: '30–365 days' },
];

const riskColors = { Low: 'success', Medium: 'warning', High: 'error' };

const steps = ['Choose Plan', 'Set Amount', 'Review & Confirm', 'Success'];

const Investments = () => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [sourceAccount, setSourceAccount] = useState('');
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    setStep(3);
    setDone(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>Investment Portfolio</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Grow your wealth through our professionally managed investment instruments.
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { label: 'Portfolio Value', value: '₦0.00', sub: 'No active investments' },
          { label: 'Total Returns', value: '+₦0.00', sub: '0.00% all time' },
          { label: 'Active Plans', value: '0', sub: 'Start investing today' },
        ].map((s, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ borderRadius: 4, bgcolor: i === 0 ? '#0f172a' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', p: 1 }}>
              <CardContent>
                <Typography variant="caption" sx={{ opacity: 0.6 }}>{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stepper activeStep={step} sx={{ mb: 5 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* Step 0: Select Plan */}
      {step === 0 && (
        <Grid container spacing={3}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} key={plan.id}>
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <Card
                  onClick={() => setSelected(plan)}
                  sx={{
                    borderRadius: 4, cursor: 'pointer', p: 1,
                    border: selected?.id === plan.id ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                    bgcolor: selected?.id === plan.id ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s'
                  }}
                >
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
                      <Chip label={plan.risk + ' Risk'} color={riskColors[plan.risk]} size="small" />
                    </Stack>
                    <Stack direction="row" spacing={3}>
                      <Box><Typography variant="caption" color="text.secondary">Expected Return</Typography><Typography variant="h6" color="success.main" fontWeight={700}>{plan.return} p.a.</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">Min. Investment</Typography><Typography variant="subtitle1" fontWeight={600}>₦{plan.min}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">Tenure</Typography><Typography variant="subtitle1" fontWeight={600}>{plan.period}</Typography></Box>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" size="large" disabled={!selected} onClick={() => setStep(1)} sx={{ borderRadius: 3, px: 5 }}>
              Continue with {selected?.name || '...'}
            </Button>
          </Grid>
        </Grid>
      )}

      {/* Step 1: Amount */}
      {step === 1 && (
        <Card sx={{ borderRadius: 4, p: 2, maxWidth: 500, border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Investment Details — {selected?.name}</Typography>
            <Stack spacing={3}>
              <TextField fullWidth label="Investment Amount (₦)" type="number" value={amount}
                onChange={e => setAmount(e.target.value)} helperText={`Minimum: ₦${selected?.min}`} />
              <TextField select fullWidth label="Fund from Account" value={sourceAccount} onChange={e => setSourceAccount(e.target.value)}>
                <MenuItem value="savings">Savings Account (₦500,000)</MenuItem>
                <MenuItem value="checking">Checking Account (₦250,000)</MenuItem>
              </TextField>
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => setStep(0)}>Back</Button>
                <Button variant="contained" disabled={!amount || !sourceAccount} onClick={() => setStep(2)}>Review Investment</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card sx={{ borderRadius: 4, p: 2, maxWidth: 500, border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Review & Confirm Investment</Typography>
            <Stack spacing={2} divider={<Divider sx={{ opacity: 0.1 }} />}>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Plan</Typography><Typography fontWeight={700}>{selected?.name}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Amount</Typography><Typography fontWeight={700}>₦{parseFloat(amount).toLocaleString()}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Expected Return</Typography><Typography fontWeight={700} color="success.main">{selected?.return} p.a.</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Tenure</Typography><Typography fontWeight={700}>{selected?.period}</Typography></Stack>
            </Stack>
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>By confirming, you agree to our investment terms and conditions.</Alert>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(1)}>Back</Button>
              <Button variant="contained" color="success" onClick={handleConfirm}>Confirm Investment</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card sx={{ borderRadius: 4, p: 4, maxWidth: 500, textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)', bgcolor: 'rgba(16,185,129,0.05)' }}>
            <CheckCircle sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Investment Confirmed!</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Your ₦{parseFloat(amount || 0).toLocaleString()} has been invested in {selected?.name}. Track your returns from your portfolio.</Typography>
            <Button variant="contained" onClick={() => { setStep(0); setSelected(null); setAmount(''); }}>Start Another Investment</Button>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default Investments;
