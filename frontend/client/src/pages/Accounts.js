import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import accountService from '../services/accountService';
import transactionService from '../services/transactionService';
import authService from '../services/authService';
import './Accounts.css';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    from_account: '',
    to_account: '',
    amount: '',
    description: ''
  });
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchAccounts();
  }, [navigate]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching accounts...');
      
      const data = await accountService.getAccounts();
      console.log('Accounts data received:', data);
      
      // Make sure we have the accounts array
      if (data && data.accounts) {
        setAccounts(data.accounts);
        
        if (data.accounts.length > 0) {
          setSelectedAccount(data.accounts[0]);
          fetchTransactions(data.accounts[0].account_id);
        } else {
          console.log('No accounts found for user');
        }
      } else {
        console.error('Unexpected data format:', data);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error in fetchAccounts:', err);
      setError(err.error || err.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (accountId) => {
    try {
      const data = await accountService.getAccountTransactions(accountId);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
    fetchTransactions(account.account_id);
  };

  const handleTransferChange = (e) => {
    setTransferData({
      ...transferData,
      [e.target.name]: e.target.value
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setTransferLoading(true);
    setError('');
    setTransferSuccess('');

    try {
      const result = await transactionService.transfer(transferData);
      setTransferSuccess('Transfer completed successfully!');
      setShowTransfer(false);
      setTransferData({
        from_account: '',
        to_account: '',
        amount: '',
        description: ''
      });
      // Refresh accounts and transactions
      fetchAccounts();
    } catch (err) {
      setError(err.error || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading accounts...</div>;

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <h1>My Accounts</h1>
        <button className="new-transfer-btn" onClick={() => setShowTransfer(!showTransfer)}>
          {showTransfer ? 'Cancel' : 'New Transfer'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {transferSuccess && <div className="success-message">{transferSuccess}</div>}

      {showTransfer && (
        <div className="transfer-form-container">
          <h2>Transfer Money</h2>
          <form onSubmit={handleTransfer} className="transfer-form">
            <div className="form-group">
              <label>From Account</label>
              <select
                name="from_account"
                value={transferData.from_account}
                onChange={handleTransferChange}
                required
              >
                <option value="">Select account</option>
                {accounts.map(acc => (
                  <option key={acc.account_id} value={acc.account_id}>
                    {acc.account_type} - {acc.account_number} (Balance: {formatCurrency(acc.balance)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>To Account Number</label>
              <input
                type="text"
                name="to_account"
                value={transferData.to_account}
                onChange={handleTransferChange}
                placeholder="Enter destination account number"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount (USD)</label>
              <input
                type="number"
                name="amount"
                value={transferData.amount}
                onChange={handleTransferChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={transferData.description}
                onChange={handleTransferChange}
                placeholder="What's this for?"
              />
            </div>

            <button type="submit" disabled={transferLoading} className="transfer-submit">
              {transferLoading ? 'Processing...' : 'Send Money'}
            </button>
          </form>
        </div>
      )}

      {accounts.length === 0 ? (
        <div className="no-accounts">
          <p>You don't have any accounts yet.</p>
          <button className="create-account-btn">Create New Account</button>
        </div>
      ) : (
        <>
          <div className="accounts-grid">
            {accounts.map(account => (
              <div 
                key={account.account_id} 
                className={`account-card ${selectedAccount?.account_id === account.account_id ? 'selected' : ''}`}
                onClick={() => handleAccountSelect(account)}
              >
                <div className="account-type">{account.account_type}</div>
                <div className="account-number">{account.account_number}</div>
                <div className="account-balance">{formatCurrency(account.balance)}</div>
                <div className={`account-status ${account.status.toLowerCase()}`}>{account.status}</div>
              </div>
            ))}
          </div>

          {selectedAccount && (
            <div className="transactions-section">
              <h2>Recent Transactions - {selectedAccount.account_type}</h2>
              <div className="transactions-list">
                {transactions.length === 0 ? (
                  <p className="no-transactions">No transactions yet</p>
                ) : (
                  transactions.map(tx => (
                    <div key={tx.transaction_id} className="transaction-item">
                      <div className="transaction-icon">
                        {tx.transaction_type === 'Transfer' ? '↔️' : 
                         tx.transaction_type === 'Deposit' ? '⬇️' : '⬆️'}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-description">{tx.description || tx.transaction_type}</div>
                        <div className="transaction-date">{formatDate(tx.created_at)}</div>
                      </div>
                      <div className={`transaction-amount ${tx.transaction_type === 'Deposit' ? 'positive' : 'negative'}`}>
                        {tx.transaction_type === 'Deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </div>
                      <div className={`transaction-status ${tx.status.toLowerCase()}`}>
                        {tx.status}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Accounts;