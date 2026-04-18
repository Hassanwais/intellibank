import React from 'react';
import { 
  Box, Typography, Grid, Paper, 
  Stack, LinearProgress, useTheme 
} from '@mui/material';
import { 
  AutoAwesome, TrendingUp, ShowChart, 
  Savings, AccountBalance, Lightbulb 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AIInsights = () => {
  const theme = useTheme();

  const metrics = [
    { title: 'Financial Health', value: 85, color: '#00f5a0', icon: <AutoAwesome /> },
    { title: 'Savings Rate', value: 24, color: '#00d2ff', icon: <Savings /> },
    { title: 'Investment Yield', value: 12.5, color: '#9d50bb', icon: <TrendingUp /> },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <AutoAwesome sx={{ color: 'primary.main', fontSize: 40 }} />
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          AI Financial Insights
        </Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Predictive analytics and smart recommendations powered by IntelliBank AI Model v4.2.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box sx={{ color: metric.color }}>{metric.icon}</Box>
                  <Typography variant="h4" fontWeight={800}>{metric.title === 'Investment Yield' ? metric.value + '%' : metric.value + '/100'}</Typography>
                </Stack>
                <Typography variant="subtitle2" color="text.secondary">{metric.title}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={metric.value} 
                  sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: metric.color } }} 
                />
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>Smart Recommendations</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(0, 210, 255, 0.05)', border: '1px solid rgba(0, 210, 255, 0.2)' }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Lightbulb sx={{ color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={700}>Optimize Savings</Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Based on your spending patterns, you can comfortably move an additional ₦45,000 to your high-interest savings vault without affecting your monthly requirements.
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption">Potential Annual Interest</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="primary.main">+₦54,000</Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 4, borderRadius: 4, background: 'rgba(157, 80, 187, 0.05)', border: '1px solid rgba(157, 80, 187, 0.2)' }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <ShowChart sx={{ color: 'secondary.main' }} />
                <Typography variant="h6" fontWeight={700}>Spending Forecast</Typography>
              </Stack>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                AI predicts a 15% increase in your utility expenses next month. Consider upgrading to our 'Smart Bills' automation to lock in current rates and avoid peak pricing.
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption">Confidence Level</Typography>
                <Typography variant="subtitle1" fontWeight={800} color="secondary.main">92%</Typography>
              </Paper>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIInsights;
