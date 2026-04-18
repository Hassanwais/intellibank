import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00e5ff', // Cyan/neon blue accent
      light: '#6effff',
      dark: '#00b2cc',
      contrastText: '#0a0a0a',
    },
    secondary: {
      main: '#bb86fc', // Deep purple/neon
      light: '#d0a9f5',
      dark: '#9a67ea',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00e676', // Emerald
      light: '#66ffa6',
      dark: '#00b248',
    },
    warning: {
      main: '#ffb300', // Gold
      light: '#ffe54c',
      dark: '#c68400',
    },
    error: {
      main: '#ff1744',
      light: '#ff616f',
      dark: '#c4001d',
    },
    background: {
      default: '#0a0e17', // Very deep navy/charcoal
      paper: '#121826', // Slightly lighter for cards
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    }
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 500 },
    body1: { fontSize: '0.875rem', lineHeight: 1.5 },
    body2: { fontSize: '0.75rem', lineHeight: 1.43 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0px 2px 4px rgba(0,0,0,0.05)',
    '0px 4px 8px rgba(0,0,0,0.05)',
    '0px 8px 16px rgba(0,0,0,0.05)',
    '0px 12px 24px rgba(0,0,0,0.05)',
    '0px 16px 32px rgba(0,0,0,0.05)',
    '0px 20px 40px rgba(0,0,0,0.05)',
    '0px 24px 48px rgba(0,0,0,0.05)',
    '0px 28px 56px rgba(0,0,0,0.05)',
    '0px 32px 64px rgba(0,0,0,0.05)',
    '0px 36px 72px rgba(0,0,0,0.05)',
    '0px 40px 80px rgba(0,0,0,0.05)',
    '0px 44px 88px rgba(0,0,0,0.05)',
    '0px 48px 96px rgba(0,0,0,0.05)',
    '0px 52px 104px rgba(0,0,0,0.05)',
    '0px 56px 112px rgba(0,0,0,0.05)',
    '0px 60px 120px rgba(0,0,0,0.05)',
    '0px 64px 128px rgba(0,0,0,0.05)',
    '0px 68px 136px rgba(0,0,0,0.05)',
    '0px 72px 144px rgba(0,0,0,0.05)',
    '0px 76px 152px rgba(0,0,0,0.05)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '12px 28px',
          fontWeight: 700,
          fontSize: '0.95rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 210, 255, 0.3)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
          border: 'none',
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background: 'rgba(13, 17, 23, 0.8)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.4)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 12, fontWeight: 600 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.04)'
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255,255,255,0.05)'
            }
          }
        }
      }
    }
  },
});