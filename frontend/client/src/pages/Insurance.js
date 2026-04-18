import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stepper, Step, StepLabel, TextField, MenuItem, Divider,
  Chip, Alert, List, ListItem, ListItemText
} from '@mui/material';
import { Gite, DirectionsCar, HealthAndSafety, FlightTakeoff, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const plans = [
  {
    id: 'life', title: 'Life Insurance', icon: <HealthAndSafety sx={{ fontSize: 48 }} />, color: '#ef4444',
    plans: [
      { name: 'Basic Life Cover', premium: '₦5,000/month', cover: '₦5,000,000' },
      { name: 'Family Protection', premium: '₦12,000/month', cover: '₦15,000,000' },
      { name: 'Comprehensive Life', premium: '₦25,000/month', cover: '₦50,000,000' },
    ]
  },
  {
    id: 'auto', title: 'Auto Insurance', icon: <DirectionsCar sx={{ fontSize: 48 }} />, color: '#f59e0b',
    plans: [
      { name: 'Third Party', premium: '₦12,000/year', cover: '₦1,000,000' },
      { name: 'Third Party + Fire & Theft', premium: '₦45,000/year', cover: '₦5,000,000' },
      { name: 'Comprehensive Motor', premium: '₦120,000/year', cover: 'Market Value' },
    ]
  },
  {
    id: 'home', title: 'Home Insurance', icon: <Gite sx={{ fontSize: 48 }} />, color: '#10b981',
    plans: [
      { name: 'Building Insurance', premium: '₦18,000/year', cover: '₦20,000,000' },
      { name: 'Contents Insurance', premium: '₦8,000/year', cover: '₦3,000,000' },
      { name: 'Combined Home Cover', premium: '₦30,000/year', cover: '₦25,000,000' },
    ]
  },
  {
    id: 'travel', title: 'Travel Insurance', icon: <FlightTakeoff sx={{ fontSize: 48 }} />, color: '#3b82f6',
    plans: [
      { name: 'Single Trip (Domestic)', premium: '₦3,500/trip', cover: '₦500,000' },
      { name: 'Single Trip (International)', premium: '₦12,000/trip', cover: '$50,000' },
      { name: 'Annual Multi-Trip', premium: '₦80,000/year', cover: '$100,000' },
    ]
  },
];

const steps = ['Select Plan', 'Your Details', 'Review Quote', 'Confirmed'];

const Insurance = () => {
  const [category, setCategory] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ full_name: '', dob: '', address: '', phone: '' });

  const handleSelectPlan = (cat, plan) => {
    setCategory(cat);
    setSelectedPlan(plan);
    setStep(1);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>Insurance</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Protect what matters most. Select a category to view plans and get a quote.
      </Typography>

      {/* Category Cards — always visible */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {plans.map((cat, i) => (
          <Grid item xs={12} sm={6} md={3} key={cat.id}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card sx={{ borderRadius: 4, textAlign: 'center', p: 2, cursor: 'default',
                border: category?.id === cat.id ? `2px solid ${cat.color}` : '1px solid rgba(255,255,255,0.08)',
                bgcolor: 'rgba(255,255,255,0.02)',
                transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 30px ${cat.color}22` }
              }}>
                <CardContent>
                  <Box sx={{ color: cat.color, mb: 2 }}>{cat.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{cat.title}</Typography>
                  <Stack spacing={1.5}>
                    {cat.plans.map((plan) => (
                      <Card key={plan.name} variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: `1px solid ${cat.color}33`, textAlign: 'left' }}>
                        <Typography variant="caption" fontWeight={700}>{plan.name}</Typography>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Cover: {plan.cover}</Typography>
                          <Typography variant="caption" sx={{ color: cat.color, fontWeight: 700 }}>{plan.premium}</Typography>
                        </Stack>
                        <Button size="small" fullWidth variant="outlined" onClick={() => handleSelectPlan(cat, plan)}
                          sx={{ mt: 1, borderRadius: 2, borderColor: cat.color, color: cat.color, fontSize: '0.7rem' }}>
                          Get Quote
                        </Button>
                      </Card>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Quote Dialog */}
      <Dialog open={step >= 1 && step < 4} onClose={() => setStep(0)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ color: category?.color }}>{category?.icon && React.cloneElement(category.icon, { sx: { fontSize: 28 } })}</Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>{category?.title}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedPlan?.name}</Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={step - 1} sx={{ mb: 3 }}>
            {steps.slice(1).map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
          </Stepper>

          {step === 1 && (
            <Stack spacing={2.5}>
              <TextField fullWidth label="Full Name (as on ID)" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
              <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
              <TextField fullWidth label="Home Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
              <TextField fullWidth label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={2} divider={<Divider sx={{ opacity: 0.1 }} />}>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Plan</Typography><Typography fontWeight={700}>{selectedPlan?.name}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Premium</Typography><Typography fontWeight={700} sx={{ color: category?.color }}>{selectedPlan?.premium}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Coverage</Typography><Typography fontWeight={700}>{selectedPlan?.cover}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Policyholder</Typography><Typography fontWeight={700}>{form.full_name}</Typography></Stack>
              <Alert severity="info" sx={{ borderRadius: 2 }}>Your policy will be activated within 24 hours of payment.</Alert>
            </Stack>
          )}

          {step === 3 && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle sx={{ fontSize: 72, color: '#10b981', mb: 2 }} />
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Policy Enrolled!</Typography>
              <Typography color="text.secondary">Policy No: INS-{Math.floor(Math.random() * 900000) + 100000}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Welcome to IntelliBank Insurance. Your documents will be sent to your email shortly.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {step < 3 && <Button onClick={() => setStep(s => s - 1)}>Back</Button>}
          {step === 1 && <Button variant="contained" onClick={() => setStep(2)} disabled={!form.full_name || !form.dob}>View Quote</Button>}
          {step === 2 && <Button variant="contained" color="success" onClick={() => setStep(3)}>Confirm & Enroll</Button>}
          {step === 3 && <Button variant="contained" onClick={() => { setStep(0); setCategory(null); setSelectedPlan(null); }}>Done</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Insurance;
