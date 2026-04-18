import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Stepper, Step, StepLabel, Card, CardContent, CircularProgress } from '@mui/material';
import transactionService from '../services/transactionService';
import accountService from '../services/accountService';
import toast, { Toaster } from 'react-hot-toast';

const MultiStepTransfer = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [transferDetails, setTransferDetails] = useState({ from_account: '', beneficiary: '', amount: '', memo: '', pin: '' });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const steps = ['Select Accounts', 'Amount & Memo', 'Review & PIN', 'Success'];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data.accounts || []);
      } catch (err) {
        toast.error('Failed to load accounts');
      }
    };
    fetchAccounts();
  }, []);

  const handleNext = async () => {
    if (activeStep === 2) {
      setLoading(true);
      try {
        await transactionService.transfer({
          from_account: transferDetails.from_account,
          to_account: transferDetails.beneficiary,
          amount: parseFloat(transferDetails.amount),
          description: transferDetails.memo || 'Transfer'
        });
        setActiveStep((prev) => prev + 1);
      } catch (err) {
        toast.error(err.error || 'Transfer failed');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Toaster position="top-right" />
      <Typography variant="h4" gutterBottom fontWeight="bold">Send Money</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
           <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Card className="glass-panel">
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" mb={2}>Select Source and Destination</Typography>
              <TextField select fullWidth label="Source Account" value={transferDetails.from_account} onChange={(e) => setTransferDetails({...transferDetails, from_account: e.target.value})} sx={{ mb: 3 }}>
                {accounts.map(acc => (
                  <MenuItem key={acc.account_id} value={acc.account_id}>
                    {acc.account_type} - {acc.account_number} (₦{acc.balance})
                  </MenuItem>
                ))}
              </TextField>
              <TextField fullWidth label="Beneficiary Account Number" value={transferDetails.beneficiary} onChange={(e) => setTransferDetails({...transferDetails, beneficiary: e.target.value})} sx={{ mb: 3 }} placeholder="Enter recipient account number" />
              <Button variant="contained" onClick={handleNext} disabled={!transferDetails.beneficiary || !transferDetails.from_account}>Next</Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" mb={2}>Enter Amount</Typography>
              <TextField fullWidth type="number" label="Amount (₦)" value={transferDetails.amount} onChange={(e) => setTransferDetails({...transferDetails, amount: e.target.value})} sx={{ mb: 3 }} />
              <TextField fullWidth label="Memo (Optional)" value={transferDetails.memo} onChange={(e) => setTransferDetails({...transferDetails, memo: e.target.value})} sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext} disabled={!transferDetails.amount}>Next</Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" mb={2}>Review and Authenticate</Typography>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 3 }}>
                <Typography><strong>To Account:</strong> {transferDetails.beneficiary}</Typography>
                <Typography><strong>Amount:</strong> ₦{transferDetails.amount}</Typography>
                <Typography><strong>Memo:</strong> {transferDetails.memo || 'N/A'}</Typography>
              </Box>
              <TextField fullWidth type="password" label="Enter 4-Digit Security PIN" inputProps={{ maxLength: 4 }} value={transferDetails.pin} onChange={(e) => setTransferDetails({...transferDetails, pin: e.target.value})} sx={{ mb: 3 }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack} disabled={loading}>Back</Button>
                <Button variant="contained" color="secondary" onClick={handleNext} disabled={transferDetails.pin.length < 4 || loading}>
                  {loading ? <CircularProgress size={24} /> : 'Confirm Transfer'}
                </Button>
              </Box>
            </Box>
          )}

          {activeStep === 3 && (
            <Box textAlign="center">
              <Typography variant="h5" color="success.main" mb={2}>Transfer Successful!</Typography>
              <Typography color="text.secondary" mb={3}>
                You have successfully sent ₦{transferDetails.amount} to {transferDetails.beneficiary}.
              </Typography>
              <Button variant="contained" onClick={() => window.location.href='/dashboard'}>Return to Dashboard</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MultiStepTransfer;
