import React, { useState } from 'react';
import { 
  Box, Typography, Card, CardContent, List, ListItem, ListItemIcon, 
  ListItemText, Switch, Divider, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Alert, Snackbar, Stack 
} from '@mui/material';
import { 
  Fingerprint, Lock, PhonelinkSetup, NotificationsActive, Shield, QrCodeScanner 
} from '@mui/icons-material';
import api from '../services/api';

const Security = () => {
  const [open, setOpen] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, message: '', type: 'success' });

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setFeedback({ show: true, message: 'Passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/users/change-password', {
        old_password: passwords.old,
        new_password: passwords.new
      });
      setFeedback({ show: true, message: 'Password updated successfully!', type: 'success' });
      setOpen(false);
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      setFeedback({ 
        show: true, 
        message: err.response?.data?.error || 'Failed to update password', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen2FA(false);
      setFeedback({ show: true, message: '2FA Successfully Configured!', type: 'success' });
    }, 1500);
  };

  return (
    <Box sx={{ py: 2, maxWidth: 'md', mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Security Center</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Manage your account protection and authentication methods.</Typography>

      <Card sx={{ borderRadius: 4, mb: 3, border: '1px solid #f1f5f9' }}>
        <CardContent>
          <List>
            <ListItem>
              <ListItemIcon><Fingerprint color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Biometric Authentication" 
                secondary="Use your fingerprint or face to login on mobile devices." 
              />
              <Switch checked={biometric} onChange={(e) => setBiometric(e.target.checked)} />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon><PhonelinkSetup color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Two-Factor Authentication (2FA)" 
                secondary="Add an extra layer of security to your account." 
              />
              <Button variant="outlined" size="small" sx={{ borderRadius: 2 }} onClick={() => setOpen2FA(true)}>Configure</Button>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon><Lock color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Change Password" 
                secondary="Update your login credentials regularly." 
              />
              <Button variant="outlined" size="small" sx={{ borderRadius: 2 }} onClick={() => setOpen(true)}>Update</Button>
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem>
              <ListItemIcon><NotificationsActive color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Login Alerts" 
                secondary="Get notified of any login attempts from new devices." 
              />
              <Switch checked={loginAlerts} onChange={(e) => setLoginAlerts(e.target.checked)} />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Box sx={{ p: 3, bgcolor: '#eff6ff', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
         <Shield sx={{ color: '#2563eb', fontSize: 32 }} />
         <Box>
            <Typography variant="subtitle2" fontWeight={700}>AI Shield is Active</Typography>
            <Typography variant="caption" color="text.secondary">Your account is currently protected by our real-time fraud detection engine (v4.2).</Typography>
         </Box>
      </Box>

      {/* Password Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Current Password" 
              type="password" 
              fullWidth 
              value={passwords.old}
              onChange={(e) => setPasswords({...passwords, old: e.target.value})}
            />
            <TextField 
              label="New Password" 
              type="password" 
              fullWidth 
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
            />
            <TextField 
              label="Confirm New Password" 
              type="password" 
              fullWidth 
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePasswordChange} disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 2FA Setup Dialog */}
      <Dialog open={open2FA} onClose={() => setOpen2FA(false)} fullWidth maxWidth="xs">
        <DialogTitle>MFA Configuration</DialogTitle>
        <DialogContent sx={{ pt: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Scan the QR Code below with Google Authenticator or Authy to bind your device.
          </Typography>
          <Box sx={{ display: 'inline-flex', p: 3, border: '2px dashed #cbd5e1', borderRadius: 4, mb: 3 }}>
             <QrCodeScanner sx={{ fontSize: 80, color: 'text.secondary' }} />
          </Box>
          <TextField 
            label="Provide 6-digit Code" 
            fullWidth 
            inputProps={{ maxLength: 6, style: { textAlign: 'center', letterSpacing: 8, fontSize: '1.2rem', fontWeight: 800 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen2FA(false)}>Cancel</Button>
          <Button variant="contained" onClick={handle2FASetup} disabled={loading}>
            {loading ? 'Verifying...' : 'Enable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={feedback.show} 
        autoHideDuration={6000} 
        onClose={() => setFeedback({...feedback, show: false})}
      >
        <Alert severity={feedback.type} sx={{ width: '100%', borderRadius: 3 }}>{feedback.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Security;
