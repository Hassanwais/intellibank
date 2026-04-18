import React, { useState, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { 
  Box, Typography, List, ListItem, ListItemAvatar, Avatar, 
  ListItemText, Divider, Paper, Stack, Chip, Button, IconButton, Snackbar, Alert
} from '@mui/material';
import { 
  Notifications as NotificationsIcon, Security, AccountBalance, 
  TrendingUp, VerifiedUser, Warning, CheckCircle, Block, Close
} from '@mui/icons-material';

// initialNotifications removed - loading from API

const typeColors = {
  error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', avatarBg: '#ef4444' },
  success: { bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', avatarBg: '#10b981' },
  info: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', avatarBg: '#6366f1' },
  primary: { bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)', avatarBg: '#3b82f6' },
  Security: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', avatarBg: '#f59e0b' },
  Transfer: { bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', avatarBg: '#6366f1' },
};

import transactionService from '../services/transactionService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      // Map icons based on type
      const mapped = (data.notifications || []).map(n => ({
        ...n,
        icon: getIcon(n.type),
        actionable: n.type === 'Security' || (n.metadata && n.metadata.transaction_id)
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === 'Security') return <Warning />;
    if (type === 'Success') return <CheckCircle />;
    return <NotificationsIcon />;
  };

  const dismiss = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.filter(n => (n.id || n.notification_id) !== id));
    } catch (err) {
      console.error('Failed to dismiss:', err);
    }
  };

  const handleAction = async (id, action, transactionId = null) => {
    try {
      if (transactionId) {
        await transactionService.resolveFraudAction(transactionId, action);
      }
      
      const messages = {
        approve: '✅ Transaction approved successfully.',
        block: '🚫 Transaction blocked. Your account is safe.',
        secure: '🔒 Account secured. All sessions terminated.',
      };
      setSnack({ open: true, message: messages[action], severity: action === 'block' || action === 'secure' ? 'warning' : 'success' });
      await dismiss(id);
    } catch (err) {
      toast.error(err.error || 'Action failed');
    }
  };

  return (
    <Box sx={{ py: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
        <NotificationsIcon sx={{ color: 'primary.main', fontSize: 40 }} />
        <Typography variant="h3" sx={{ fontWeight: 800 }}>Notifications</Typography>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Stay informed. Take action on security alerts and flagged transactions.
      </Typography>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <List sx={{ p: 0 }}>
          {notifications.length === 0 && (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 60, color: '#10b981', mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>All Clear!</Typography>
              <Typography variant="body2" color="text.secondary">No pending notifications.</Typography>
            </Box>
          )}
          {notifications.map((notif, index) => (
            <React.Fragment key={notif.id}>
              <ListItem
                alignItems="flex-start"
                sx={{
                  py: 3, px: 4,
                  bgcolor: typeColors[notif.type]?.bg,
                  borderLeft: `4px solid ${typeColors[notif.type]?.avatarBg}`,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' }
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: typeColors[notif.type]?.avatarBg, color: 'white' }}>
                    {notif.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight={700}>{notif.title}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">{notif.time}</Typography>
                        <IconButton size="small" onClick={() => dismiss(notif.id)} sx={{ opacity: 0.4, '&:hover': { opacity: 1 } }}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: notif.actionable ? 2 : 0 }}>
                        {notif.message}
                      </Typography>
                      {notif.metadata && notif.metadata.transaction_id && (
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                            onClick={() => handleAction(notif.id, 'approve', notif.metadata.transaction_id)} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            Approve
                          </Button>
                          <Button size="small" variant="contained" color="error" startIcon={<Block />}
                            onClick={() => handleAction(notif.id, 'block', notif.metadata.transaction_id)} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            Block
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => dismiss(notif.id)} sx={{ borderRadius: 2 }}>
                            Dismiss
                          </Button>
                        </Stack>
                      )}
                      {notif.actionable && !notif.metadata?.transaction_id && !notif.security && (
                        <Stack direction="row" spacing={1}>
                          <Button size="small" variant="contained" color="success" startIcon={<CheckCircle />}
                            onClick={() => handleAction(notif.id, 'approve')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            Approve
                          </Button>
                          <Button size="small" variant="contained" color="error" startIcon={<Block />}
                            onClick={() => handleAction(notif.id, 'block')} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            Block
                          </Button>
                          <Button size="small" variant="outlined" onClick={() => dismiss(notif.id)} sx={{ borderRadius: 2 }}>
                            Dismiss
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < notifications.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} sx={{ width: '100%', fontWeight: 700, borderRadius: 3 }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;
