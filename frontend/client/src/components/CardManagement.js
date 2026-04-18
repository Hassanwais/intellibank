import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Stepper, Step, StepLabel, Card, CardContent, CircularProgress, Tabs, Tab } from '@mui/material';
import cardService from '../services/cardService';
import accountService from '../services/accountService';
import toast, { Toaster } from 'react-hot-toast';

const CardManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [cardDetails, setCardDetails] = useState({ type: '', address: 'Home Address', account_id: '' });
  const [externalCard, setExternalCard] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const steps = ['Select Card Type', 'Confirm Address', 'Success'];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data.accounts || []);
      } catch (err) {
        toast.error('Failed to fetch accounts');
      }
    };
    fetchAccounts();
  }, []);

  const handleNext = async () => {
    if (activeStep === 1) {
      setLoading(true);
      try {
        await cardService.requestCard({
          account_id: cardDetails.account_id,
          card_type: cardDetails.type
        });
        setActiveStep((prev) => prev + 1);
      } catch (err) {
        toast.error(err.error || 'Failed to request card');
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleLinkExternalCard = () => {
    if (!externalCard.cardNumber || !externalCard.expiry || !externalCard.cvv) {
       toast.error("Please fill all card details");
       return;
    }
    setLoading(true);
    setTimeout(() => {
       toast.success("External Card Linked Successfully!");
       setExternalCard({ cardNumber: '', expiry: '', cvv: '' });
       setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Toaster position="top-right" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">Card Management</Typography>
      </Box>

      <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)} sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
         <Tab label="Request New Card" />
         <Tab label="Link External Card" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
               <Step key={label}><StepLabel>{label}</StepLabel></Step>
            ))}
          </Stepper>

          <Card className="glass-panel">
            <CardContent sx={{ p: 4 }}>
              {activeStep === 0 && (
                <Box>
                  <Typography variant="h6" mb={2}>Select Account and Card Type</Typography>
                  <TextField select fullWidth label="Linked Account" value={cardDetails.account_id} onChange={(e) => setCardDetails({...cardDetails, account_id: e.target.value})} sx={{ mb: 3 }}>
                    {accounts.map(acc => (
                      <MenuItem key={acc.account_id} value={acc.account_id}>
                        {acc.account_type} - {acc.account_number}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField select fullWidth label="Card Type" value={cardDetails.type} onChange={(e) => setCardDetails({...cardDetails, type: e.target.value})} sx={{ mb: 3 }}>
                    <MenuItem value="Debit">Standard Debit Card</MenuItem>
                    <MenuItem value="Credit">Rewards Credit Card</MenuItem>
                    <MenuItem value="Metal">Premium Metal Card</MenuItem>
                  </TextField>
                  <Button variant="contained" onClick={handleNext} disabled={!cardDetails.type || !cardDetails.account_id}>Next</Button>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Typography variant="h6" mb={2}>Confirm Delivery Address</Typography>
                  <TextField select fullWidth label="Delivery Address" value={cardDetails.address} onChange={(e) => setCardDetails({...cardDetails, address: e.target.value})} sx={{ mb: 3 }}>
                    <MenuItem value="Home Address">Primary Home Address</MenuItem>
                    <MenuItem value="Branch">Pick up at Branch</MenuItem>
                  </TextField>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" onClick={handleBack} disabled={loading}>Back</Button>
                    <Button variant="contained" color="primary" onClick={handleNext} disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : 'Confirm Request'}
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && (
                <Box textAlign="center">
                  <Typography variant="h5" color="success.main" mb={2}>Card Requested successfully!</Typography>
                  <Typography color="text.secondary" mb={3}>
                    Your new {cardDetails.type} card linked to the selected account will arrive in 5-7 business days.
                  </Typography>
                  <Button variant="contained" onClick={() => window.location.href='/dashboard'}>Return to Dashboard</Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}

      {tabValue === 1 && (
        <Card className="glass-panel">
          <CardContent sx={{ p: 4, maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h6" mb={3}>Securely Link Your External Card</Typography>
            <TextField 
              fullWidth label="Card Number" placeholder="0000 0000 0000 0000" sx={{ mb: 3 }}
              value={externalCard.cardNumber} onChange={(e) => setExternalCard({...externalCard, cardNumber: e.target.value})}
            />
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
               <TextField 
                 fullWidth label="Expiry Date" placeholder="MM/YY"
                 value={externalCard.expiry} onChange={(e) => setExternalCard({...externalCard, expiry: e.target.value})}
               />
               <TextField 
                 fullWidth label="CVV" type="password" placeholder="***" inputProps={{ maxLength: 4 }}
                 value={externalCard.cvv} onChange={(e) => setExternalCard({...externalCard, cvv: e.target.value})}
               />
            </Box>
            <Button 
               variant="contained" fullWidth size="large" 
               onClick={handleLinkExternalCard} disabled={loading}
            >
               {loading ? <CircularProgress size={24} color="inherit" /> : 'Link Card'}
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CardManagement;
