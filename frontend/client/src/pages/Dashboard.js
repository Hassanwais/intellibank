import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>🏦 Intelligent Banking</h2>
        <div className="nav-items">
          <span>Welcome, {user.full_name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <h1>Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Balance</h3>
            <p className="stat-value">$1,000.00</p>
          </div>
          
          <div className="stat-card">
            <h3>Accounts</h3>
            <p className="stat-value">2</p>
          </div>
          
          <div className="stat-card">
            <h3>Recent Transactions</h3>
            <p className="stat-value">5</p>
          </div>
          
          <div className="stat-card">
            <h3>Fraud Alerts</h3>
            <p className="stat-value">0</p>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/accounts" className="action-btn">View Accounts</Link>
	    <Link to="/fraud-alerts" className="action-btn">Fraud Alerts</Link>
            <button className="action-btn">Transfer Money</button>
            <button className="action-btn">View Transactions</button>
            <button className="action-btn">Report Fraud</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;