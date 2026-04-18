import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, Avatar } from '@mui/material';
import { Security, Warning, Info, CheckCircle, ThumbUp, Block } from '@mui/icons-material';
import { motion } from 'framer-motion';
import transactionService from '../services/transactionService';
import toast from 'react-hot-toast';

const FraudAlertCard = ({ alert, onRefresh }) => {
  const { 
    fraud_id, 
    alert_id, 
    transaction_id, 
    alert_severity, 
    description, 
    status, 
    created_at, 
    confidence_score 
  } = alert;

  const idToUse = fraud_id || alert_id;

  const handleAction = async (action) => {
    try {
      const confirmed = window.confirm(`Are you sure you want to ${action} this transaction?`);
      if (!confirmed) return;

      await transactionService.resolveFraudAction(transaction_id, action);
      toast.success(`Transaction successfully ${action}d`);
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err.error || `Failed to ${action} transaction`);
    }
  };

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'High':
      case 'Critical':
        return { color: '#ef4444', bgcolor: '#fef2f2', icon: <Warning /> };
      case 'Medium':
        return { color: '#f59e0b', bgcolor: '#fffbeb', icon: <Info /> };
      default:
        return { color: '#10b981', bgcolor: '#f0fdf4', icon: <CheckCircle /> };
    }
  };

  const config = getSeverityConfig(alert_severity);

  return (
    <Card 
      sx={{ 
        borderRadius: 4, 
        borderLeft: `5px solid ${config.color}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        mb: 2
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: config.bgcolor, color: config.color, width: 32, height: 32 }}>
              {React.cloneElement(config.icon, { sx: { fontSize: 18 } })}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>{alert_severity} Risk Alert</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(created_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Chip 
            label={status} 
            size="small" 
            sx={{ 
              fontWeight: 700, 
              fontSize: '0.65rem',
              bgcolor: status === 'Pending' ? '#fff7ed' : '#f0fdf4',
              color: status === 'Pending' ? '#c2410c' : '#15803d'
            }} 
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 0.5 }}>
          {description}
        </Typography>

        <Box sx={{ bgcolor: '#f8fafc', p: 1.5, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: status === 'Pending' ? 1.5 : 0 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">AI Confidence</Typography>
              <Typography variant="body2" fontWeight={800} color={config.color}>
                {(confidence_score * 100).toFixed(1)}%
              </Typography>
            </Box>
            {status !== 'Pending' && (
              <Button size="small" variant="text" sx={{ textTransform: 'none', fontWeight: 700 }}>
                Details
              </Button>
            )}
          </Box>

          {status === 'Pending' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                fullWidth 
                size="small" 
                variant="contained" 
                color="success"
                startIcon={<ThumbUp />}
                onClick={() => handleAction('approve')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Approve
              </Button>
              <Button 
                fullWidth 
                size="small" 
                variant="contained" 
                color="error"
                startIcon={<Block />}
                onClick={() => handleAction('block')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                Block
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FraudAlertCard;
