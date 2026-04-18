import React from 'react';
import { 
  Drawer, List, ListItem, ListItemButton, ListItemIcon, 
  ListItemText, Box, Typography, Avatar, Chip, Button 
} from '@mui/material';
import {
  Dashboard as DashboardIcon, AccountBalanceWallet, Security,
  Assessment, Logout, VerifiedUser, Shield, Send, History,
  Lock, Settings, Help, CreditCard, AccountBalance, AutoAwesome,
  ShowChart, MapsHomeWork, Gite, Savings, CurrencyBitcoin, BarChart
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const drawerWidth = 280;

const Sidebar = ({ open, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const isAdmin = user && (user.user_role === 'Admin' || user.user_role === 'SuperAdmin');

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Accounts', icon: <AccountBalanceWallet />, path: '/accounts' },
    { text: 'Transactions', icon: <History />, path: '/transactions' },
    { text: 'Transfer Money', icon: <Send />, path: '/transfer' },
    { text: 'Bills Payment', icon: <CreditCard />, path: '/bills-payment' },
    { text: 'AI Insights', icon: <AutoAwesome />, path: '/ai-insights' },
    { text: 'Cards Management', icon: <CreditCard />, path: '/cards' },
    { text: 'Loans', icon: <AccountBalance />, path: '/loans' },
    { text: 'Investments', icon: <ShowChart />, path: '/investments' },
    { text: 'Mortgages', icon: <MapsHomeWork />, path: '/mortgages' },
    { text: 'Insurance', icon: <Gite />, path: '/insurance' },
    { text: 'Wealth Management', icon: <Savings />, path: '/wealth' },
    { text: 'Cryptocurrency', icon: <CurrencyBitcoin />, path: '/crypto' },
    { text: 'Reports', icon: <BarChart />, path: '/reports' },
  ];

  if (isAdmin) {
    menuItems.push(
      { text: 'Fraud Alerts', icon: <Security color="error" />, path: '/fraud-alerts' },
      { text: 'Admin Portal', icon: <Assessment />, path: '/admin' }
    );
  }

  const secondaryItems = [
    { text: 'Notifications', icon: <VerifiedUser />, path: '/notifications' },
    { text: 'Security', icon: <Lock />, path: '/security' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
    { text: 'Help Support', icon: <Help />, path: '/support' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Logo Section */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Shield sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight={800} sx={{ flex: 1, color: 'text.primary', letterSpacing: -0.5 }}>IntelliBank</Typography>
        <Chip label="PRO" size="small" sx={{ bgcolor: 'rgba(0,229,255,0.1)', color: 'primary.main', fontWeight: 700, fontSize: '0.65rem' }} />
      </Box>
      
      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Avatar sx={{ width: 44, height: 44, bgcolor: 'secondary.main', fontSize: '1.2rem', fontWeight: 600 }}>
          {user?.full_name?.charAt(0) || 'A'}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="subtitle2" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>
            {user?.full_name || 'Guest User'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {user?.email || 'user@example.com'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
             <VerifiedUser sx={{ fontSize: 12, color: 'success.main', mr: 0.5 }} />
             <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Verified Account</Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', mb: 1, display: 'block' }}>
          Main Menu
        </Typography>
        <List sx={{ p: 0 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
                selected={location.pathname === item.path}
                sx={{ 
                  borderRadius: 2, 
                  '&.Mui-selected': { 
                    bgcolor: 'rgba(0,229,255,0.1)', 
                    color: 'primary.main',
                    boxShadow: 'inset 4px 0 0 #00e5ff',
                    '& .MuiListItemIcon-root': { color: 'primary.main' }
                  },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: location.pathname === item.path ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.875rem', 
                    fontWeight: location.pathname === item.path ? 700 : 500 
                  }} 
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', mt: 3, mb: 1, display: 'block' }}>
          System
        </Typography>
        <List sx={{ p: 0 }}>
          {secondaryItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onClose();
                }}
                selected={location.pathname === item.path}
                sx={{ 
                  borderRadius: 2, 
                  '&.Mui-selected': { bgcolor: 'rgba(0,229,255,0.1)', color: 'primary.main', boxShadow: 'inset 4px 0 0 #00e5ff', '& .MuiListItemIcon-root': { color: 'primary.main'} },
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } 
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: location.pathname === item.path ? 'inherit' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Promo Card */}
      {/* Promo Card removed from Sidebar, it is now in Rightbar */}
      
      {/* Logout Button */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2, color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}>
          <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}><Logout /></ListItemIcon>
          <ListItemText primary="Sign Out" primaryTypographyProps={{ fontWeight: 600 }} />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? open : true}
        onClose={onClose}
        ModalProps={{ keepMounted: true }} 
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth, 
            borderRight: 'none',
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)'
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
