import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Box, Avatar, 
  Menu, MenuItem, Badge, Tooltip, Divider, ListItemIcon, 
  ListItemText, Dialog, DialogContent, TextField, InputAdornment, Button, Stack
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, Search, Logout, 
  Settings, HelpOutline, Shield, CheckCircle, Block, Cancel
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import fraudService from '../services/fraudService';
import transactionService from '../services/transactionService';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    try {
      const data = await fraudService.getFraudAlerts();
      setAlerts(data.alerts?.filter(a => a.status === 'Pending') || []);
    } catch (e) {
      console.error("Failed to fetch alerts", e);
    }
  };

  const handleFraudAction = async (alert, action) => {
    try {
      if (action === 'Approve') {
         await transactionService.updateTransactionStatus(alert.transaction_id, 'Success');
         await fraudService.updateAlertStatus(alert.fraud_id, 'False Positive');
      } else if (action === 'Block') {
         await transactionService.updateTransactionStatus(alert.transaction_id, 'Failed');
         await fraudService.updateAlertStatus(alert.fraud_id, 'Reviewed');
      } else {
         // Just dismiss
         await fraudService.updateAlertStatus(alert.fraud_id, 'Dismissed');
      }
      loadAlerts();
    } catch (e) {
      console.error('Failed to action alert', e);
    }
  };

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleNotifMenuOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setNotifAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    authService.logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      navigate('/accounts');
    }
  };

  return (
    <>
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        backgroundColor: 'rgba(10, 14, 23, 0.8)', 
        backdropFilter: 'blur(12px)',
        color: '#f8fafc',
        boxShadow: '0 4px 30px rgba(0,0,0,0.5)',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
             <Shield sx={{ color: 'primary.main' }} />
             <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5, color: 'text.primary' }}>IntelliBank</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
          <Tooltip title="Search">
            <IconButton color="inherit" size="small" onClick={() => setSearchOpen(true)}>
              <Search />
            </IconButton>
          </Tooltip>

          <Tooltip title="Notifications">
            <IconButton color="inherit" onClick={handleNotifMenuOpen} size="small">
              <Badge badgeContent={alerts.length} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 1, cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
            <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2, color: 'text.primary' }}>{user?.full_name?.split(' ')[0] || 'User'}</Typography>
              <Typography variant="caption" color="primary" sx={{ display: 'block' }}>Verified</Typography>
            </Box>
            <Avatar 
              sx={{ 
                width: 38, height: 38, 
                bgcolor: 'rgba(0,229,255,0.1)', 
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1px solid rgba(0,229,255,0.3)',
                boxShadow: '0 0 10px rgba(0,229,255,0.2)'
              }}
            >
              {user?.full_name?.charAt(0) || 'U'}
            </Avatar>
          </Box>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          elevation={4}
          sx={{ '& .MuiPaper-root': { borderRadius: 4, mt: 1, minWidth: 220, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
             <Typography variant="subtitle2" fontWeight={700} color="text.primary">{user?.full_name || 'Ahmad Uwais'}</Typography>
             <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.05)' }} />
          <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>
             <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
             <ListItemText primary="Account Settings" />
          </MenuItem>
          <MenuItem onClick={() => { handleClose(); navigate('/support'); }}>
             <ListItemIcon><HelpOutline fontSize="small" /></ListItemIcon>
             <ListItemText primary="Help Center" />
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
             <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
             <ListItemText primary="Log Out" />
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleClose}
          elevation={4}
          sx={{ '& .MuiPaper-root': { borderRadius: 4, mt: 1, minWidth: 280, maxWidth: 350, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.1)' } }}
        >
          <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <Typography variant="subtitle2" fontWeight={700} color="text.primary">AI Alerts</Typography>
             <Typography variant="caption" color="primary" sx={{ cursor: 'pointer', fontWeight: 600 }}>Clear all</Typography>
          </Box>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
          {alerts.length > 0 ? alerts.slice(0, 5).map((alert, idx) => (
             <Box key={idx} sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                 <Typography variant="body2" fontWeight={600} color="warning.main">{alert.fraud_type}</Typography>
                 <Typography variant="caption" color="text.secondary" display="block">Amount: ₦{alert.amount}</Typography>
                 <Stack direction="row" spacing={1} mt={1}>
                    <Button size="small" variant="contained" color="success" onClick={() => handleFraudAction(alert, 'Approve')} startIcon={<CheckCircle />}>Approve</Button>
                    <Button size="small" variant="contained" color="error" onClick={() => handleFraudAction(alert, 'Block')} startIcon={<Block />}>Block</Button>
                    <IconButton size="small" onClick={() => handleFraudAction(alert, 'Dismiss')}><Cancel fontSize="small" /></IconButton>
                 </Stack>
             </Box>
          )) : (
             <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">All caught up! No alerts.</Typography>
             </Box>
          )}
           <MenuItem sx={{ justifyContent: 'center', mt: 1 }} onClick={() => { handleClose(); navigate('/fraud-alerts'); }}>
             <Typography variant="caption" fontWeight={700} color="primary">View All Alerts</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>

    <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, top: -100 } }}>
      <form onSubmit={handleSearchSubmit}>
        <DialogContent sx={{ p: 1 }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="Search accounts, transactions, or contacts..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              sx: { borderRadius: 2, '& fieldset': { border: 'none' } }
            }}
          />
        </DialogContent>
      </form>
    </Dialog>
    </>
  );
};

export default Navbar;
