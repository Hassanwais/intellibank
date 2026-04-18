import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Stack,
  Stepper, Step, StepLabel, TextField, MenuItem, Divider,
  Alert, Slider, Chip
} from '@mui/material';
import { MapsHomeWork, Calculate, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const steps = ['Eligibility Check', 'Property Details', 'Review Application', 'Submitted'];

const Mortgages = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    monthly_income: '', employer: '', employment_type: 'Employed',
    property_value: '', down_payment: '', loan_term: 20, property_type: 'Residential'
  });

  const loanAmount = (parseFloat(form.property_value) || 0) - (parseFloat(form.down_payment) || 0);
  const monthlyRate = 0.15 / 12;
  const n = form.loan_term * 12;
  const monthlyPayment = loanAmount > 0 && n > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    : 0;

  const isEligible = parseFloat(form.monthly_income) >= monthlyPayment * 2.5;

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>Mortgage Center</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Secure your dream home with competitive rates and flexible terms.
      </Typography>

      <Stepper activeStep={step} sx={{ mb: 5 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {/* Step 0: Eligibility */}
      {step === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 2, border: '1px solid rgba(255,255,255,0.08)' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Eligibility Check</Typography>
                <Stack spacing={3}>
                  <TextField fullWidth label="Monthly Income (₦)" type="number" value={form.monthly_income}
                    onChange={e => setForm({ ...form, monthly_income: e.target.value })} />
                  <TextField fullWidth label="Employer / Business Name" value={form.employer}
                    onChange={e => setForm({ ...form, employer: e.target.value })} />
                  <TextField select fullWidth label="Employment Type" value={form.employment_type}
                    onChange={e => setForm({ ...form, employment_type: e.target.value })}>
                    {['Employed', 'Self-Employed', 'Civil Servant', 'Business Owner'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                  <Button variant="contained" size="large" onClick={() => setStep(1)} disabled={!form.monthly_income || !form.employer} sx={{ borderRadius: 3 }}>
                    Check Eligibility
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 4, p: 2, bgcolor: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.08)', height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Mortgage Calculator</Typography>
                <Stack spacing={2}>
                  <TextField fullWidth label="Property Value (₦)" type="number" value={form.property_value}
                    onChange={e => setForm({ ...form, property_value: e.target.value })}
                    sx={{ '& .MuiInputBase-root': { color: 'white' }, '& label': { color: '#94a3b8' }, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                  <TextField fullWidth label="Down Payment (₦)" type="number" value={form.down_payment}
                    onChange={e => setForm({ ...form, down_payment: e.target.value })}
                    sx={{ '& .MuiInputBase-root': { color: 'white' }, '& label': { color: '#94a3b8' }, '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' } }} />
                  <Typography variant="body2" sx={{ color: '#94a3b8' }}>Loan Term: {form.loan_term} years</Typography>
                  <Slider value={form.loan_term} onChange={(e, v) => setForm({ ...form, loan_term: v })} min={5} max={30} step={5} marks sx={{ color: '#6366f1' }} />
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: '#94a3b8' }}>Loan Amount</Typography>
                    <Typography fontWeight={700}>₦{loanAmount > 0 ? loanAmount.toLocaleString() : '0'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: '#94a3b8' }}>Monthly Payment (est.)</Typography>
                    <Typography fontWeight={700} color="success.main">₦{monthlyPayment > 0 ? monthlyPayment.toLocaleString('en-NG', { maximumFractionDigits: 0 }) : '0'}</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography sx={{ color: '#94a3b8' }}>Interest Rate</Typography>
                    <Typography fontWeight={700}>15% p.a.</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Step 1: Property Details */}
      {step === 1 && (
        <Card sx={{ borderRadius: 4, p: 2, maxWidth: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Property Details</Typography>
            {isEligible
              ? <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>✅ Pre-qualified! Your income qualifies for this mortgage.</Alert>
              : <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>Your income may be insufficient. Estimated monthly: ₦{monthlyPayment.toLocaleString('en-NG', { maximumFractionDigits: 0 })}. You need at least ₦{(monthlyPayment * 2.5).toLocaleString('en-NG', { maximumFractionDigits: 0 })} monthly income.</Alert>
            }
            <Stack spacing={3}>
              <TextField fullWidth label="Property Location / Address" />
              <TextField select fullWidth label="Property Type" value={form.property_type}
                onChange={e => setForm({ ...form, property_type: e.target.value })}>
                {['Residential', 'Commercial', 'Land', 'Mixed-Use'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
              <TextField fullWidth label="BVN (Bank Verification Number)" inputProps={{ maxLength: 11 }} />
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => setStep(0)}>Back</Button>
                <Button variant="contained" onClick={() => setStep(2)}>Continue to Review</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <Card sx={{ borderRadius: 4, p: 2, maxWidth: 600, border: '1px solid rgba(255,255,255,0.08)' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Application Review</Typography>
            <Stack spacing={2} divider={<Divider sx={{ opacity: 0.1 }} />}>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Property Value</Typography><Typography fontWeight={700}>₦{parseFloat(form.property_value || 0).toLocaleString()}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Down Payment</Typography><Typography fontWeight={700}>₦{parseFloat(form.down_payment || 0).toLocaleString()}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Loan Amount</Typography><Typography fontWeight={700}>₦{loanAmount.toLocaleString()}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Monthly Repayment</Typography><Typography fontWeight={700} color="success.main">₦{monthlyPayment.toLocaleString('en-NG', { maximumFractionDigits: 0 })}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Loan Term</Typography><Typography fontWeight={700}>{form.loan_term} years</Typography></Stack>
            </Stack>
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>Our mortgage team will reach out within 2–3 business days to complete verification.</Alert>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={() => setStep(1)}>Back</Button>
              <Button variant="contained" color="success" onClick={() => setStep(3)}>Submit Application</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Submitted */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card sx={{ borderRadius: 4, p: 4, maxWidth: 500, textAlign: 'center', border: '1px solid rgba(16,185,129,0.3)', bgcolor: 'rgba(16,185,129,0.05)' }}>
            <CheckCircle sx={{ fontSize: 80, color: '#10b981', mb: 2 }} />
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Application Submitted!</Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>Reference: MRG-{Math.floor(Math.random() * 90000) + 10000}</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Our mortgage advisors will contact you within 2–3 business days. Check your email for confirmation.</Typography>
            <Button variant="contained" onClick={() => setStep(0)}>New Application</Button>
          </Card>
        </motion.div>
      )}
    </Box>
  );
};

export default Mortgages;
