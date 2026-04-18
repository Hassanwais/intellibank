import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Stack,
  Chip, LinearProgress, Divider, List, ListItem, ListItemText,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert
} from '@mui/material';
import { Savings, TrendingUp, AccountBalance, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';

const products = [
  {
    id: 'goal', name: 'Goal-Based Savings', icon: '🎯', color: '#6366f1',
    desc: 'Set a target and automate saving towards it.',
    features: ['Set custom savings goals', 'Auto-debit scheduling', 'Progress tracking', 'Interest up to 12% p.a.']
  },
  {
    id: 'pension', name: 'Pension Management', icon: '🏦', color: '#10b981',
    desc: 'Manage your RSA and voluntary contributions.',
    features: ['RSA account integration', 'Voluntary contributions', 'Retirement projection tool', 'Fund manager selection']
  },
  {
    id: 'estate', name: 'Estate Planning', icon: '📜', color: '#f59e0b',
    desc: 'Protect and distribute your assets wisely.',
    features: ['Will drafting guidance', 'Asset management', 'Beneficiary designation', 'Trust account setup']
  },
  {
    id: 'portfolio', name: 'Managed Portfolio', icon: '📊', color: '#3b82f6',
    desc: 'Let our experts manage a diversified portfolio.',
    features: ['Professional fund management', 'Quarterly statements', 'Risk profiling', 'Tax optimization']
  },
];

const WealthManagement = () => {
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ goal_name: '', target_amount: '', monthly_saving: '', timeline: '12' });

  const handleOpen = (product) => {
    setSelected(product);
    setStep(0);
    setOpen(true);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" fontWeight={800} sx={{ mb: 1 }}>Wealth Management</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Build, protect, and grow your wealth with expert-guided financial planning tools.
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        {[
          { label: 'Net Worth', value: '₦0.00', sub: 'Connect accounts to compute' },
          { label: 'Monthly Savings Rate', value: '0%', sub: 'Set a goal to track progress' },
          { label: 'Active Plans', value: '0', sub: 'Start your wealth journey' },
        ].map((s, i) => (
          <Grid item xs={12} md={4} key={i}>
            <Card sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)', p: 1 }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.sub}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Product Cards */}
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Wealth Products</Typography>
      <Grid container spacing={3}>
        {products.map((p, i) => (
          <Grid item xs={12} sm={6} key={p.id}>
            <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
              <Card sx={{ borderRadius: 4, p: 1, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)', height: '100%' }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 36 }}>{p.icon}</Typography>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{p.desc}</Typography>
                    </Box>
                  </Stack>
                  <List dense disablePadding sx={{ mb: 2 }}>
                    {p.features.map(f => (
                      <ListItem key={f} disableGutters sx={{ py: 0.3 }}>
                        <CheckCircle sx={{ fontSize: 14, color: p.color, mr: 1 }} />
                        <ListItemText primary={f} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                  <Button variant="contained" fullWidth onClick={() => handleOpen(p)}
                    sx={{ borderRadius: 3, fontWeight: 700, bgcolor: p.color, '&:hover': { bgcolor: p.color, filter: 'brightness(1.1)' } }}>
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Setup Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontSize: 28 }}>{selected?.icon}</Typography>
            <Typography variant="h6" fontWeight={700}>{selected?.name}</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {step === 0 && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField fullWidth label="Plan / Goal Name" value={form.goal_name} onChange={e => setForm({ ...form, goal_name: e.target.value })} placeholder="e.g. Dream Home, Children's Education" />
              <TextField fullWidth label="Target Amount (₦)" type="number" value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} />
              <TextField fullWidth label="Monthly Contribution (₦)" type="number" value={form.monthly_saving} onChange={e => setForm({ ...form, monthly_saving: e.target.value })} />
              <TextField select fullWidth label="Timeline" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })}>
                {['6', '12', '24', '36', '60', '120'].map(m => <MenuItem key={m} value={m}>{m} months</MenuItem>)}
              </TextField>
            </Stack>
          )}
          {step === 1 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircle sx={{ fontSize: 72, color: '#10b981', mb: 2 }} />
              <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>Plan Created!</Typography>
              <Typography color="text.secondary">"{form.goal_name}" has been set up. We'll auto-debit ₦{parseFloat(form.monthly_saving || 0).toLocaleString()} monthly.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          {step === 0 && <>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => setStep(1)} disabled={!form.goal_name || !form.target_amount}>
              Create Plan
            </Button>
          </>}
          {step === 1 && <Button variant="contained" fullWidth onClick={() => { setOpen(false); setStep(0); }}>Done</Button>}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WealthManagement;
