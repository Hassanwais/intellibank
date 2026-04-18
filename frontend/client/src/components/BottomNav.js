import React, { useState } from 'react';
import { Paper, BottomNavigation, BottomNavigationAction, useMediaQuery, useTheme } from '@mui/material';
import { Dashboard as DashboardIcon, Send as SendIcon, CreditCard as CardIcon, Person as ProfileIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomNav = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);

  // Only render on mobile/tablet views where Main sidebar is hidden or constrained
  if (!isMobile) return null;

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(18, 24, 38, 0.9)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)' }} elevation={3}>
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          navigate(newValue);
        }}
        sx={{ background: 'transparent' }}
      >
        <BottomNavigationAction label="Dashboard" value="/dashboard" icon={<DashboardIcon />} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }} />
        <BottomNavigationAction label="Transfer" value="/transfer" icon={<SendIcon />} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }} />
        <BottomNavigationAction label="Cards" value="/cards" icon={<CardIcon />} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }} />
        <BottomNavigationAction label="Profile" value="/settings" icon={<ProfileIcon />} sx={{ color: 'text.secondary', '&.Mui-selected': { color: 'primary.main' } }} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
