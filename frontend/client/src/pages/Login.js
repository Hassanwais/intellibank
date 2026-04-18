import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Fingerprint,
  QrCodeScanner,
  Security,
  Lock,
  Email,
  Phone,
  Google,
  Facebook,
  Apple,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { motion } from 'framer-motion';

const validationSchema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const steps = ['Enter Credentials', 'Verify Identity', 'Access Granted'];

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      setActiveStep(1);
      
      try {
        const response = await authService.login(values.email, values.password);
        
        if (response.mfa_required) {
          setShowMFA(true);
        } else {
          setActiveStep(2);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Login failed');
        setActiveStep(0);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleMFAVerify = async () => {
    if (mfaCode.length === 6) {
      setLoading(true);
      try {
        const response = await authService.verifyMFA(mfaCode);
        if (response.verified) {
          setActiveStep(2);
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        } else {
          setError('Invalid MFA code');
        }
      } catch (err) {
        setError('MFA verification failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #1e293b, #0f172a, #020617)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(0,210,255,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(157,80,187,0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          {/* Left Side - Branding */}
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: '100%', md: 400 },
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Security sx={{ fontSize: 48, mr: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                  IntelliBank
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
                AI-Powered Smart Banking
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
                Experience the future of banking with real-time fraud detection,
                intelligent insights, and military-grade security.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, mt: 4 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    99.9%
                  </Typography>
                  <Typography variant="body2">Fraud Detection Rate</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    <Security />
                  </Typography>
                  <Typography variant="body2">Bank-Grade Security</Typography>
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    24/7
                  </Typography>
                  <Typography variant="body2">AI Monitoring</Typography>
                </Box>
              </Box>
            </motion.div>
          </Box>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ flex: 1, minWidth: 400 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
            >
              <Stepper activeStep={activeStep} sx={{ mb: 4, '& .MuiStepLabel-label': { color: 'rgba(255,255,255,0.5)' }, '& .MuiStepLabel-label.Mui-active': { color: 'white' }, '& .MuiStepLabel-label.Mui-completed': { color: 'primary.main' } }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {activeStep === 0 && (
                <Box component="form" onSubmit={formik.handleSubmit}>
                  <Typography variant="h4" sx={{ mb: 1, fontWeight: 800 }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
                    Sign in to access your intelligent banking dashboard
                  </Typography>

                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    variant="outlined"
                    margin="normal"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'rgba(255,255,255,0.4)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.6)' } }}
                  />

                  <TextField
                    fullWidth
                    id="password"
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    margin="normal"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'rgba(255,255,255,0.4)' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{ color: 'rgba(255,255,255,0.4)' }}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.6)' } }}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: 'primary.main' } }}
                        />
                      }
                      label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Remember me</Typography>}
                    />
                    <Link href="/forgot-password" variant="body2" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                      Forgot password?
                    </Link>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.8,
                      fontSize: '1rem',
                      boxShadow: '0 4px 14px 0 rgba(0, 210, 255, 0.39)',
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Secure Sign In'}
                  </Button>

                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Fingerprint />}
                      onClick={() => setShowQRDialog(true)}
                    >
                      Biometric
                    </Button>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<QrCodeScanner />}
                    >
                      QR Code
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Or continue with
                    </Typography>
                  </Divider>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button fullWidth variant="outlined" startIcon={<Google />}>
                      Google
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<Facebook />}>
                      Facebook
                    </Button>
                    <Button fullWidth variant="outlined" startIcon={<Apple />}>
                      Apple
                    </Button>
                  </Box>

                  <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                    Don't have an account?{' '}
                    <Link href="/register" underline="hover">
                      Sign up
                    </Link>
                  </Typography>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Security sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
                    <Typography variant="h5">Two-Factor Authentication</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Enter the 6-digit code from your authenticator app
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    label="Authentication Code"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    inputProps={{ maxLength: 6 }}
                    sx={{ mb: 3 }}
                  />
                  
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleMFAVerify}
                    disabled={loading || mfaCode.length !== 6}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Verify'}
                  </Button>

                  <Button
                    fullWidth
                    variant="text"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setActiveStep(0);
                      setMfaCode('');
                    }}
                  >
                    Back to login
                  </Button>
                </Box>
              )}

              {activeStep === 2 && (
                <Box sx={{ textAlign: 'center' }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Security sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
                  </motion.div>
                  <Typography variant="h5" sx={{ mb: 1 }}>
                    Access Granted
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Redirecting to your dashboard...
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Box>
      </Container>

      {/* Biometric Dialog */}
      <Dialog open={showQRDialog} onClose={() => setShowQRDialog(false)}>
        <DialogTitle>Biometric Authentication</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Use your fingerprint or face ID for quick access
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Fingerprint sx={{ fontSize: 80, color: '#667eea' }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQRDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowQRDialog(false)}>
            Authenticate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;