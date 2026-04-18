import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  FormControl, InputLabel, Select, MenuItem, TextField, 
  Alert, Stack, Chip, Divider, IconButton
} from '@mui/material';
import { 
  Assessment, Description, Warning, History, 
  CloudDownload, PictureAsPdf, TableChart
} from '@mui/icons-material';
import reportService from '../services/reportService';
import authService from '../services/authService';
import accountService from '../services/accountService';
import { useEffect } from 'react';

function Reports() {
  const [user] = useState(authService.getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportType, setReportType] = useState('statement');
  
  const [statementParams, setStatementParams] = useState({
    account_id: '',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    format: 'pdf'
  });
  
  const [fraudParams, setFraudParams] = useState({
    from_date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to_date: new Date().toISOString().split('T')[0],
    format: 'pdf'
  });
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        const accs = data.accounts || [];
        setAccounts(accs);
        if (accs.length > 0) {
          setStatementParams(prev => ({ ...prev, account_id: accs[0].account_id }));
        }
      } catch (err) {
        console.error('Failed to fetch accounts:', err);
      }
    };
    fetchAccounts();
  }, []);
  
  const navigate = useNavigate();

  const handleDownload = async (type) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let blob;
      let filename;
      
      if (type === 'statement') {
        blob = await reportService.getMonthlyStatement(statementParams);
        filename = `statement_${statementParams.year}_${statementParams.month}.${statementParams.format}`;
      } else {
        blob = await reportService.getFraudSummary(fraudParams);
        filename = `fraud_summary_${fraudParams.from_date}_to_${fraudParams.to_date}.${fraudParams.format}`;
      }
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setSuccess(`${type === 'statement' ? 'Statement' : 'Fraud Report'} generated and downloaded successfully!`);
    } catch (err) {
      console.error('Report error:', err);
      setError('Failed to generate report. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const isAdmin = user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'fraud_analyst';
  
  return (
    <Box sx={{ py: 2, maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Reporting Center</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Generate and download detailed financial and security reports.
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>{success}</Alert>}
      
      <Grid container spacing={3}>
        {/* Sidebar / Tabs */}
        <Grid item xs={12} md={3}>
          <Stack spacing={1}>
            <Button 
              variant={reportType === 'statement' ? 'contained' : 'text'} 
              startIcon={<Description />} 
              onClick={() => setReportType('statement')}
              sx={{ justifyContent: 'flex-start', borderRadius: 2, py: 1.5 }}
              fullWidth
            >
              Account statement
            </Button>
            <Button 
              variant={reportType === 'fraud' ? 'contained' : 'text'} 
              startIcon={<Warning />} 
              onClick={() => setReportType('fraud')}
              sx={{ justifyContent: 'flex-start', borderRadius: 2, py: 1.5 }}
              fullWidth
            >
              Fraud Summary
            </Button>
            {isAdmin && (
              <>
                <Button 
                  variant={reportType === 'performance' ? 'contained' : 'text'} 
                  startIcon={<Assessment />} 
                  onClick={() => setReportType('performance')}
                  sx={{ justifyContent: 'flex-start', borderRadius: 2, py: 1.5 }}
                  fullWidth
                >
                  System Performance
                </Button>
                <Button 
                  variant={reportType === 'sar' ? 'contained' : 'text'} 
                  startIcon={<History />} 
                  onClick={() => setReportType('sar')}
                  sx={{ justifyContent: 'flex-start', borderRadius: 2, py: 1.5 }}
                  fullWidth
                >
                  SAR Report
                </Button>
              </>
            )}
          </Stack>
        </Grid>

        {/* Content Area */}
        <Grid item xs={12} md={9}>
          <Card sx={{ borderRadius: 4, border: '1px solid #f1f5f9' }}>
            <CardContent sx={{ p: 4 }}>
              {reportType === 'statement' && (
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Monthly Account Statement</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Download a comprehensive record of all transactions for a specific month.</Typography>
                  
                  <Stack spacing={3}>
                    <FormControl fullWidth>
                      <InputLabel>Select Account</InputLabel>
                      <Select 
                        value={statementParams.account_id}
                        label="Select Account"
                        onChange={(e) => setStatementParams({...statementParams, account_id: e.target.value})}
                      >
                        {accounts.map(acc => (
                          <MenuItem key={acc.account_id} value={acc.account_id}>
                            {acc.account_type} Account (...{acc.account_number.slice(-4)})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField 
                          fullWidth 
                          label="Year" 
                          type="number" 
                          value={statementParams.year}
                          onChange={(e) => setStatementParams({...statementParams, year: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl fullWidth>
                          <InputLabel>Month</InputLabel>
                          <Select 
                            value={statementParams.month}
                            label="Month"
                            onChange={(e) => setStatementParams({...statementParams, month: e.target.value})}
                          >
                            <MenuItem value={1}>January</MenuItem>
                            <MenuItem value={2}>February</MenuItem>
                            <MenuItem value={3}>March</MenuItem>
                            <MenuItem value={4}>April</MenuItem>
                            {/* ... others ... */}
                            <MenuItem value={12}>December</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Export Format</Typography>
                      <Stack direction="row" spacing={1}>
                        <Chip 
                          icon={<PictureAsPdf />} 
                          label="PDF Document" 
                          onClick={() => setStatementParams({...statementParams, format: 'pdf'})}
                          color={statementParams.format === 'pdf' ? 'primary' : 'default'}
                          variant={statementParams.format === 'pdf' ? 'filled' : 'outlined'}
                        />
                        <Chip 
                          icon={<TableChart />} 
                          label="CSV Spreadsheet" 
                          onClick={() => setStatementParams({...statementParams, format: 'csv'})}
                          color={statementParams.format === 'csv' ? 'primary' : 'default'}
                          variant={statementParams.format === 'csv' ? 'filled' : 'outlined'}
                        />
                      </Stack>
                    </Box>

                    <Button 
                      variant="contained" 
                      size="large" 
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownload('statement')}
                      disabled={loading || !statementParams.account_id}
                      sx={{ borderRadius: 3, py: 1.5, bgcolor: '#6366f1' }}
                    >
                      {loading ? 'Processing...' : 'Generate and Download'}
                    </Button>
                  </Stack>
                </Box>
              )}

              {reportType === 'fraud' && (
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Fraud Detection Summary</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Overview of flagged transactions and AI shield interventions.</Typography>
                  
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <TextField 
                          fullWidth 
                          label="From Date" 
                          type="date" 
                          InputLabelProps={{ shrink: true }}
                          value={fraudParams.from_date}
                          onChange={(e) => setFraudParams({...fraudParams, from_date: e.target.value})}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField 
                          fullWidth 
                          label="To Date" 
                          type="date" 
                          InputLabelProps={{ shrink: true }}
                          value={fraudParams.to_date}
                          onChange={(e) => setFraudParams({...fraudParams, to_date: e.target.value})}
                        />
                      </Grid>
                    </Grid>

                    <Button 
                      variant="contained" 
                      size="large" 
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownload('fraud')}
                      disabled={loading}
                      sx={{ borderRadius: 3, py: 1.5, bgcolor: '#6366f1' }}
                    >
                      {loading ? 'Generating...' : 'Download Report'}
                    </Button>
                  </Stack>
                </Box>
              )}

              {(reportType === 'performance' || reportType === 'sar') && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Assessment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" fontWeight={700}>Compliance Report Ready</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    This administrative report contains sensitive security data.
                  </Typography>
                  <Button variant="outlined" startIcon={<CloudDownload />}>Download Admin Package</Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports;