import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Rightbar from './Rightbar';
import BottomNav from './BottomNav';
import Footer from './Footer';

const drawerWidth = 280;

const Layout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      <Sidebar 
        open={mobileOpen} 
        onClose={handleDrawerToggle} 
        isMobile={isMobile} 
      />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar /> {/* Spacer for fixed Navbar */}
        <Box sx={{ flexGrow: 1, py: 2 }}>
          {children}
        </Box>
        <Footer />
      </Box>

      {/* Rightbar for desktop */}
      <Rightbar />

      {/* Bottom Nav for mobile */}
      <BottomNav />
    </Box>
  );
};

export default Layout;
