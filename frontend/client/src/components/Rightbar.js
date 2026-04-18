import React from 'react';
import { 
  Box, Paper, Typography, Button, IconButton, Divider, List, 
  ListItem, ListItemText, ListItemAvatar, Avatar, Dialog, 
  DialogTitle, DialogContent, DialogActions, Stack 
} from '@mui/material';
import { 
  Add as AddIcon, Notifications as NotificationsIcon, CreditCard as CardIcon, 
  Send as SendIcon, CheckCircle, Star, WorkspacePremium 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const Rightbar = () => {
  const navigate = useNavigate();
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  
  const recentActivities = [
    { title: 'Payment Received', desc: '+₦500.00 from John Doe', date: '2 min ago' },
    { title: 'Amazon Purchase', desc: '-₦120.50', date: '5 hours ago' },
    { title: 'Security Alert', desc: 'New login from Chrome/Windows', date: '1 day ago' },
  ];

  const handleUpgrade = () => {
    toast.success("🚀 Premium Features Activated! Your metal card is in production.");
    setShowUpgrade(false);
  };

  return (
    <Box sx={{ width: 320, p: 3, display: { xs: 'none', lg: 'block' }, borderLeft: '1px solid rgba(255,255,255,0.05)', height: 'calc(100vh - 64px)', position: 'sticky', top: 64, overflowY: 'auto' }}>
      
      {/* Quick Actions */}
      <Box mb={4}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: '700' }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Button variant="contained" color="primary" startIcon={<SendIcon />} onClick={() => navigate('/transfer')} sx={{ py: 1.5 }}>
            Transfer
          </Button>
          <Button variant="contained" color="secondary" startIcon={<AddIcon />} onClick={() => navigate('/bills-payment')} sx={{ py: 1.5 }}>
            Top-up
          </Button>
          <Button variant="outlined" color="info" startIcon={<CardIcon />} onClick={() => navigate('/cards')} sx={{ py: 1.5, gridColumn: 'span 2' }}>
            Request New Card
          </Button>
        </Box>
      </Box>

      {/* Notifications */}
      <Box mb={4}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: '700' }}>
            System Alerts
          </Typography>
          <IconButton size="small" color="primary" onClick={() => navigate('/fraud-alerts')}>
            <NotificationsIcon fontSize="small" />
          </IconButton>
        </Box>
        <Paper elevation={0} sx={{ background: 'rgba(255,255,255,0.03)', borderRadius: 4, overflow: 'hidden' }}>
          <List disablePadding>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: index === 0 ? 'success.main' : index === 1 ? 'error.main' : 'warning.main', width: 32, height: 32 }}>
                      {activity.title.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle2" color="white">{activity.title}</Typography>}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.secondary" display="block">
                          {activity.desc}
                        </Typography>
                        <Typography component="span" variant="caption" color="primary">
                          {activity.date}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < recentActivities.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Promo/Ad space for premium features */}
      <Paper sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(187, 134, 252, 0.2) 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" color="white" fontWeight="bold" gutterBottom>
          Upgrade to Premium
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Get 0% foreign transaction fees and exclusive metal cards.
        </Typography>
        <Button 
          variant="contained" 
          fullWidth 
          onClick={() => setShowUpgrade(true)}
          sx={{ background: '#fff', color: '#000', fontWeight: 800, '&:hover': { background: '#f0f0f0' } }}
        >
          Upgrade Now
        </Button>
      </Paper>

      {/* Premium Upgrade Dialog */}
      <Dialog open={showUpgrade} onClose={() => setShowUpgrade(false)} PaperProps={{ sx: { borderRadius: 5, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' } }}>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <WorkspacePremium sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight={800} color="white">Go IntelliBank Pro</Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
               <CheckCircle color="primary" />
               <Typography variant="body2" color="white">0% foreign transaction fees on all Global Transfers</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
               <CheckCircle color="primary" />
               <Typography variant="body2" color="white">Exclusive Metal Debit Card (Titanium or Black)</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
               <CheckCircle color="primary" />
               <Typography variant="body2" color="white">AI Financial Planner & Tax Assistant</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
               <CheckCircle color="primary" />
               <Typography variant="body2" color="white">Priority 24/7 Human-Support Line</Typography>
            </Box>
            <Box sx={{ p: 2, bgcolor: 'rgba(0,229,255,0.1)', borderRadius: 3, border: '1px solid rgba(0,229,255,0.2)' }}>
               <Typography variant="caption" color="primary" fontWeight={700}>ONLY ₦2,500 / MONTH</Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setShowUpgrade(false)} sx={{ color: 'text.secondary' }}>Later</Button>
          <Button variant="contained" onClick={handleUpgrade} sx={{ borderRadius: 3, fontWeight: 800 }}>Confirm Upgrade</Button>
        </DialogActions>
      </Dialog>
      <Toaster position="top-right" />
    </Box>
  );
};

export default Rightbar;
