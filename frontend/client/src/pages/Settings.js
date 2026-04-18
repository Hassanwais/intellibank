import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Card, CardContent, TextField, 
  Button, Grid, Avatar, Divider, Stack, List, ListItem, ListItemIcon, 
  ListItemText, ListItemButton, Paper, MenuItem, IconButton, 
  InputAdornment, Alert, LinearProgress, Tab, Tabs
} from '@mui/material';
import {
  Security, Person, Lock, Save, Email, Phone, Visibility, 
  VisibilityOff, NotificationsActive, Home, Info, Help, Fingerprint
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast, { Toaster } from 'react-hot-toast';

const countries = [
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+1', name: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+91', name: 'India', flag: '🇮🇳' },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    address: {
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Nigeria'
    }
  });

  const [securityData, setSecurityData] = useState({
    gmail_app_password: '',
    alert_email: '',
    alert_phone: '',
    alert_country: '+234'
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, securityRes] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/security-settings')
      ]);
      
      if (profileRes.user) {
        setProfile({
          full_name: profileRes.user.full_name || '',
          email: profileRes.user.email || '',
          phone_number: profileRes.user.phone_number || '',
          address: profileRes.user.address || {
            address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'Nigeria'
          }
        });
      }
      
      setSecurityData({
        gmail_app_password: securityRes.gmail_app_password || '',
        alert_email: securityRes.alert_email || '',
        alert_phone: securityRes.alert_phone || '',
        alert_country: '+234'
      });
    } catch (err) {
      console.error(err);
      toast.error('Connection timeout: Could not reach secure synchronization node.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      if (activeTab === 'profile') {
        await api.put('/users/profile', profile);
      } else if (activeTab === 'security') {
        await api.put('/users/security-settings', securityData);
      }
      toast.success('Preferences successfully synchronized');
    } catch (err) {
      toast.error(err.error || 'Update synchronization failed');
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'My Identity', icon: <Person /> },
    { id: 'address', label: 'Physical Address', icon: <Home /> },
    { id: 'security', label: 'AI Security Alerts', icon: <NotificationsActive /> },
    { id: 'password', label: 'Vault Access', icon: <Lock /> },
  ];

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Toaster position="top-right" />
      <Grid container spacing={4}>
        {/* Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <Avatar sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontWeight: 900 }}>
                {profile.full_name[0]}
              </Avatar>
              <Typography variant="h6" fontWeight={800}>{profile.full_name}</Typography>
              <Typography variant="caption" color="text.secondary">Secure Hub #{(profile.email.length * 1234).toString().slice(-6)}</Typography>
            </Box>
            <Divider />
            <List sx={{ p: 1 }}>
              {menuItems.map((item) => (
                <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    selected={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    sx={{ borderRadius: 3, '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } }}
                  >
                    <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={<Typography fontWeight={activeTab === item.id ? 700 : 500}>{item.label}</Typography>} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Content */}
        <Grid item xs={12} md={9}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ borderRadius: 6, p: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                <CardContent>
                  {activeTab === 'profile' && (
                    <Stack spacing={3}>
                      <Typography variant="h5" fontWeight={900}>Personal Identity</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Full Name" variant="outlined" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Phone Number" variant="outlined" value={profile.phone_number} onChange={(e) => setProfile({...profile, phone_number: e.target.value})} />
                        </Grid>
                      </Grid>
                      <TextField fullWidth label="System Identification Email" variant="outlined" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} helperText="Primary login identifier" />
                      <Button variant="contained" size="large" onClick={handleUpdate} disabled={saving}>Maintain Identity</Button>
                    </Stack>
                  )}

                  {activeTab === 'address' && (
                    <Stack spacing={3}>
                      <Typography variant="h5" fontWeight={900}>Physical Address Details</Typography>
                      <TextField fullWidth label="Street Address Line 1" variant="outlined" value={profile.address.address_line1} onChange={(e) => setProfile({...profile, address: {...profile.address, address_line1: e.target.value}})} />
                      <TextField fullWidth label="Street Address Line 2 (Optional)" variant="outlined" value={profile.address.address_line2} onChange={(e) => setProfile({...profile, address: {...profile.address, address_line2: e.target.value}})} />
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="City" variant="outlined" value={profile.address.city} onChange={(e) => setProfile({...profile, address: {...profile.address, city: e.target.value}})} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="State" variant="outlined" value={profile.address.state} onChange={(e) => setProfile({...profile, address: {...profile.address, state: e.target.value}})} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField fullWidth label="Postal Code" variant="outlined" value={profile.address.postal_code} onChange={(e) => setProfile({...profile, address: {...profile.address, postal_code: e.target.value}})} />
                        </Grid>
                      </Grid>
                      <Button variant="contained" size="large" onClick={handleUpdate} disabled={saving}>Secure Address Record</Button>
                    </Stack>
                  )}

                  {activeTab === 'security' && (
                    <Stack spacing={3}>
                      <Typography variant="h5" fontWeight={900}>AI-Shield Alert Nodes</Typography>
                      <Alert severity="warning" sx={{ borderRadius: 4 }}>
                        <Typography variant="subtitle2" fontWeight={800}>How to generate Gmail App Password:</Typography>
                        <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                          1. Go to your Google Account Settings.<br/>
                          2. Select <b>Security</b> &gt; <b>2-Step Verification</b>.<br/>
                          3. Scroll to the bottom and select <b>App passwords</b>.<br/>
                          4. Select 'Mail' and 'Other' (Bank App).<br/>
                          5. Copy the 16-character code here.
                        </Typography>
                      </Alert>
                      
                      <TextField 
                        fullWidth 
                        label="Destination Alert Email" 
                        variant="outlined" 
                        value={securityData.alert_email} 
                        onChange={(e) => setSecurityData({...securityData, alert_email: e.target.value})} 
                      />

                      <TextField 
                        fullWidth 
                        label="Gmail App Password Node" 
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined" 
                        value={securityData.gmail_app_password} 
                        onChange={(e) => setSecurityData({...securityData, gmail_app_password: e.target.value})}
                        helperText="Use the 16-character code from your Google Account security settings."
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPassword(!showPassword);
                                }}
                                onMouseDown={(e) => e.preventDefault()}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      
                      <Button variant="contained" size="large" onClick={handleUpdate} disabled={saving} sx={{ py: 1.5, background: 'linear-gradient(45deg, #6366f1, #00f5a0)' }}>Synchronize Alert Nodes</Button>
                    </Stack>
                  )}

                  {activeTab === 'password' && (
                    <Stack spacing={3}>
                      <Typography variant="h5" fontWeight={900}>Vault Access Credentials</Typography>
                      <TextField fullWidth label="Current Password" type="password" variant="outlined" />
                      <Divider />
                      <TextField fullWidth label="New Secure Password" type="password" variant="outlined" />
                      <TextField fullWidth label="Confirm New Password" type="password" variant="outlined" />
                      <Button variant="contained" color="error" size="large">Update Vault Access</Button>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;
