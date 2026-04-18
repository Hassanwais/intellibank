import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Transfer from './pages/Transfer';
import Cards from './pages/Cards';
import Loans from './pages/Loans';
import AdminDashboard from './pages/AdminDashboard';
import FraudAlerts from './pages/FraudAlerts';
import Reports from './pages/Reports';
import Security from './pages/Security';
import Settings from './pages/Settings';
import Support from './pages/Support';
import BillsPayment from './pages/BillsPayment';
import AIInsights from './pages/AIInsights';
import Notifications from './pages/Notifications';
import Investments from './pages/Investments';
import Mortgages from './pages/Mortgages';
import Insurance from './pages/Insurance';
import WealthManagement from './pages/WealthManagement';
import Cryptocurrency from './pages/Cryptocurrency';
import authService from './services/authService';
import Layout from './components/Layout';
import './App.css';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/accounts" element={<ProtectedRoute><Accounts /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="/transfer" element={<ProtectedRoute><Transfer /></ProtectedRoute>} />
            <Route path="/cards" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/fraud-alerts" element={<ProtectedRoute><FraudAlerts /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="/bills-payment" element={<ProtectedRoute><BillsPayment /></ProtectedRoute>} />
            <Route path="/ai-insights" element={<ProtectedRoute><AIInsights /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><Investments /></ProtectedRoute>} />
            <Route path="/mortgages" element={<ProtectedRoute><Mortgages /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
            <Route path="/wealth" element={<ProtectedRoute><WealthManagement /></ProtectedRoute>} />
            <Route path="/crypto" element={<ProtectedRoute><Cryptocurrency /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;