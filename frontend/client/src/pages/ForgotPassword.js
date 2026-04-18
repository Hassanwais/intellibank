import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Alert, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setStatus({ type: 'error', message: 'Please enter your email address.' });
      return;
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // Assuming a backend endpoint exists, or we mock success.
      await axios.post('http://localhost:5001/api/auth/forgot-password', { email });
      setStatus({ type: 'success', message: 'If an account with that email exists, we have sent a password reset link.' });
    } catch (err) {
      // For security reasons, often it's better to just show success regardless, but here we'll show errors if they occur
      setStatus({ type: 'success', message: 'If an account with that email exists, we have sent a password reset link.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f4f6f8', py: 6 }}>
      <Container maxWidth="sm">
        <Typography variant="h3" fontWeight="bold" textAlign="center" sx={{ mb: 1, color: '#1976d2' }}>
          IntelliBank
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
          Security & Trust unified.
        </Typography>

        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>Reset Password</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </Typography>

            {status.message && (
              <Alert severity={status.type} sx={{ mb: 4 }}>
                {status.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 4 }}
                required
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mb: 3, py: 1.5, fontSize: '1.1rem', textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
              </Button>
            </form>

            <Box textAlign="center">
              <Typography variant="body2">
                Remember your password?{' '}
                <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 600 }}>
                  Back to Login
                </Link>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
