import React, { useState } from 'react';
import { Box, Typography, Button, TextField, MenuItem, Stepper, Step, StepLabel, Card, CardContent } from '@mui/material';

const LoanApplication = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loanDetails, setLoanDetails] = useState({ type: '', amount: '', term: '' });
  
  const steps = ['Select Loan Type', 'Loan Details', 'Review & Apply', 'Success'];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">Apply for a Loan</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card className="glass-panel">
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" mb={2}>What type of loan do you need?</Typography>
              <TextField select fullWidth label="Loan Type" value={loanDetails.type} onChange={(e) => setLoanDetails({...loanDetails, type: e.target.value})} sx={{ mb: 3 }}>
                <MenuItem value="Personal">Personal Loan</MenuItem>
                <MenuItem value="Auto">Auto Loan</MenuItem>
                <MenuItem value="Home">Home Mortgage</MenuItem>
              </TextField>
              <Button variant="contained" onClick={handleNext} disabled={!loanDetails.type}>Next</Button>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" mb={2}>Enter Loan Amount and Term</Typography>
              <TextField fullWidth type="number" label="Amount (₦)" value={loanDetails.amount} onChange={(e) => setLoanDetails({...loanDetails, amount: e.target.value})} sx={{ mb: 3 }} />
              <TextField select fullWidth label="Term (Months)" value={loanDetails.term} onChange={(e) => setLoanDetails({...loanDetails, term: e.target.value})} sx={{ mb: 3 }}>
                <MenuItem value="12">12 Months (1 Year)</MenuItem>
                <MenuItem value="24">24 Months (2 Years)</MenuItem>
                <MenuItem value="60">60 Months (5 Years)</MenuItem>
              </TextField>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Back</Button>
                <Button variant="contained" onClick={handleNext} disabled={!loanDetails.amount || !loanDetails.term}>Next</Button>
              </Box>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" mb={2}>Review Terms</Typography>
              <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, mb: 3 }}>
                <Typography><strong>Type:</strong> {loanDetails.type}</Typography>
                <Typography><strong>Amount:</strong> ₦{loanDetails.amount}</Typography>
                <Typography><strong>Term:</strong> {loanDetails.term} Months</Typography>
                <Typography><strong>Estimated APR:</strong> 5.0%</Typography>
                <Typography><strong>Est. Monthly Payment:</strong> ₦{((Number(loanDetails.amount)*1.05)/Number(loanDetails.term)).toFixed(2)}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={3}>
                By clicking "Submit Application", you authorize IntelliBank to check your credit profile.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleBack}>Back</Button>
                <Button variant="contained" color="primary" onClick={handleNext}>Submit Application</Button>
              </Box>
            </Box>
          )}

          {activeStep === 3 && (
            <Box textAlign="center">
              <Typography variant="h5" color="success.main" mb={2}>Application Submitted Successfully!</Typography>
              <Typography color="text.secondary" mb={3}>
                Your application is under review. Our team will contact you within 24 hours.
              </Typography>
              <Button variant="contained" onClick={() => window.location.href='/dashboard'}>Return to Dashboard</Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoanApplication;
