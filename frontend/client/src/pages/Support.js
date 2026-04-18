import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, 
  TextField, Paper, Avatar, Stack, IconButton,
  CircularProgress
} from '@mui/material';
import { 
  Chat, Email, Send, Close
} from '@mui/icons-material';

const faqs = [
  { q: "How do I reset my password?", a: "Go to Security menu → click 'Update' next to Change Password." },
  { q: "What is AI Shield?", a: "AI Shield is our real-time behavioral fraud detection engine that monitors every transaction for suspicious activity." },
  { q: "How long do transfers take?", a: "Internal transfers are instant. External transfers typically take 1–3 business days depending on the destination bank." },
  { q: "How do I open a new account?", a: "Go to the Accounts tab → click 'Open New Account' and complete the form." },
  { q: "How do I dispute a transaction?", a: "Go to Transactions → find the transaction → click 'Dispute'. Our team will review within 24–48 hours." },
];

const getBotReply = (input) => {
  const p = input.toLowerCase();
  if (p.includes('password') || p.includes('login')) return "To manage your password, visit the 'Security' section from the left menu and click 'Update' under Change Password.";
  if (p.includes('transfer') || p.includes('send money')) return "Internal transfers are instant and free! Go to 'Transfer Money' from the sidebar. For external banks, it takes 1–3 business days.";
  if (p.includes('limit') || p.includes('daily')) return "Your standard daily transaction limit is ₦1,000,000. You can request a limit increase via the Settings page.";
  if (p.includes('account') || p.includes('open') || p.includes('create')) return "You can open a new account from the 'Accounts' tab. We support Savings, Checking, Current, and Business accounts.";
  if (p.includes('fraud') || p.includes('suspicious') || p.includes('block')) return "If you notice suspicious activity, go to 'Security' to freeze your card instantly, or contact us at support@intellibank.ng.";
  if (p.includes('loan') || p.includes('borrow')) return "We offer personal and business loans. Visit the 'Loans' section in the sidebar to check your eligibility and apply.";
  if (p.includes('bill') || p.includes('payment') || p.includes('utility')) return "You can pay all utility bills — electricity, airtime, data, DSTV, flights, and more — from the 'Bills Payment' menu.";
  if (p.includes('card') || p.includes('debit') || p.includes('credit')) return "Manage all your cards from the 'Cards Management' section. You can request new cards or link external ones.";
  if (p.includes('statement') || p.includes('download') || p.includes('pdf')) return "Go to 'Accounts' → select any account → click 'Download Statement'. You can filter by date range and export as PDF or CSV.";
  if (p.includes('hello') || p.includes('hi') || p.includes('hey')) return "Hello! Welcome to IntelliBank Support 👋. How can I assist you today?";
  if (p.includes('human') || p.includes('agent') || p.includes('person')) return "I'll connect you with a live agent. Please hold on... Agent joining in approximately 5 minutes. You can also email us at support@intellibank.ng.";
  if (p.includes('invest') || p.includes('stock') || p.includes('mutual')) return "Explore our Investment portfolio section from the sidebar to open an investment account and track your holdings.";
  if (p.includes('mortgage') || p.includes('home') || p.includes('property')) return "Our Mortgage Center offers competitive rates. Use the calculator in the 'Mortgages' section to estimate your repayments.";
  if (p.includes('insurance')) return "We offer life, auto, home, and travel insurance plans. Visit the 'Insurance' section to view plans and get a quote.";
  if (p.includes('crypto') || p.includes('bitcoin') || p.includes('ethereum')) return "You can buy, sell and track cryptocurrency directly from the 'Cryptocurrency' section in the sidebar.";
  if (p.includes('wealth') || p.includes('savings goal') || p.includes('pension')) return "Visit 'Wealth Management' in the sidebar to set savings goals, manage your pension or get a managed portfolio.";
  if (p.includes('balance') || p.includes('money')) return "You can view your total balance on the Dashboard or check individual account balances in the 'Accounts' section.";
  if (p.includes('report') || p.includes('statement') || p.includes('csv')) return "The Reporting Center allows you to generate PDF statements, CSV exports, and fraud summaries for any of your accounts.";
  if (p.includes('naira') || p.includes('currency') || p.includes('₦')) return "IntelliBank primarily uses Naira (₦) for domestic transactions, but you can also manage multi-currency accounts in the 'Accounts' settings.";
  return "I'm sorry, I didn't quite understand that. Could you rephrase? You can ask me about transfers, accounts, loans, cards, bills, crypto, or security.";
};

const Support = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { text: "Hello! 👋 I'm your IntelliBank AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatOpen]);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setChatHistory(prev => [...prev, { text: trimmed, sender: 'user' }]);
    setMessage('');
    setTyping(true);
    setTimeout(() => {
      const reply = getBotReply(trimmed);
      setTyping(false);
      setChatHistory(prev => [...prev, { text: reply, sender: 'bot' }]);
    }, 1000 + Math.random() * 800);
  };

  return (
    <Box sx={{ py: 2, maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Help & Support</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Find answers to common questions or talk to our AI assistant.</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 4, mb: 4, border: '1px solid rgba(255,255,255,0.08)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Frequently Asked Questions</Typography>
              <Stack spacing={2}>
                {faqs.map((faq, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>{faq.q}</Typography>
                    <Typography variant="body2" color="text.secondary">{faq.a}</Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            <Card sx={{ borderRadius: 4, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white' }}>
              <CardContent sx={{ p: 4 }}>
                <Chat sx={{ fontSize: 40, mb: 2 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>AI Live Chat</Typography>
                <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>Get instant answers from our AI banking assistant, 24/7.</Typography>
                <Button variant="contained" sx={{ bgcolor: 'white', color: '#6366f1', fontWeight: 700, '&:hover': { bgcolor: '#f1f5f9' } }} fullWidth onClick={() => setChatOpen(true)}>
                  Start Chat
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ borderRadius: 4, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(255,255,255,0.02)' }}>
              <CardContent sx={{ p: 4 }}>
                <Email sx={{ color: '#6366f1', fontSize: 40, mb: 2 }} />
                <Typography variant="h6" fontWeight={700} gutterBottom>Email Support</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Average response time: 2 hours. Available Mon–Fri 8am–6pm.</Typography>
                <Button variant="outlined" fullWidth onClick={() => window.location.href='mailto:support@intellibank.ng'}>Send Email</Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Chat Box */}
      {chatOpen && (
        <Paper
          elevation={24}
          sx={{
            position: 'fixed', bottom: 24, right: 24,
            width: 370, height: 500, borderRadius: 4,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            zIndex: 1400, border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)'
          }}
        >
          {/* Chat Header */}
          <Box sx={{ p: 2, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 36, height: 36, bgcolor: 'white', color: '#6366f1', fontWeight: 800 }}>AI</Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>IntelliBank Support</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>● Online · Typically replies instantly</Typography>
              </Box>
            </Stack>
            <IconButton size="small" sx={{ color: 'white' }} onClick={() => setChatOpen(false)}><Close /></IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flex: 1, p: 2, overflowY: 'auto', bgcolor: '#0f172a', display: 'flex', flexDirection: 'column' }}>
            {chatHistory.map((h, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: h.sender === 'user' ? 'flex-end' : 'flex-start', mb: 1.5 }}>
                <Paper sx={{
                  p: 1.5, maxWidth: '82%',
                  borderRadius: h.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: h.sender === 'user' ? '#6366f1' : '#1e293b',
                  color: 'white', boxShadow: 'none'
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{h.text}</Typography>
                </Paper>
              </Box>
            ))}
            {typing && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1.5 }}>
                <Paper sx={{ p: 1.5, borderRadius: '16px 16px 16px 4px', bgcolor: '#1e293b' }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CircularProgress size={10} sx={{ color: '#6366f1' }} />
                    <Typography variant="caption" sx={{ color: '#94a3b8' }}>Typing...</Typography>
                  </Stack>
                </Paper>
              </Box>
            )}
            <div ref={chatEndRef} style={{ float: "left", clear: "both" }} />
          </Box>

          {/* Input Bar */}
          <Box sx={{ 
            p: '12px 16px', 
            bgcolor: '#1e293b', 
            borderTop: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.2)'
          }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <TextField
                size="small"
                fullWidth
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#0f172a', 
                    color: '#f8fafc', 
                    borderRadius: 4,
                    height: 48,
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!message.trim()}
                sx={{ 
                  bgcolor: '#6366f1', 
                  color: 'white', 
                  width: 48,
                  height: 48,
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#4f46e5', transform: 'scale(1.05)' }, 
                  '&:disabled': { bgcolor: '#334155', color: '#64748b' }, 
                  borderRadius: 3,
                  transition: 'all 0.2s'
                }}
              >
                <Send fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Support;
