CREATE TYPE account_status AS ENUM ('Active', 'Suspended', 'Closed');
CREATE TYPE account_type AS ENUM ('Savings', 'Checking', 'Business', 'Joint');
CREATE TYPE transaction_type AS ENUM ('Deposit', 'Withdrawal', 'Transfer', 'Payment', 'Fee');
CREATE TYPE transaction_status AS ENUM ('Pending', 'Success', 'Failed', 'Cancelled', 'Flagged');
CREATE TYPE alert_status AS ENUM ('Pending', 'Reviewed', 'False Positive', 'Resolved');
CREATE TYPE alert_severity AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE user_role AS ENUM ('Customer', 'Fraud Analyst', 'Admin', 'SuperAdmin');
CREATE TYPE currency_code AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'INR', 'NGN');

-- ============================================
-- STEP 3: CREATE TABLES IN 3NF
-- ============================================

-- Table 1: users (Customer information)
-- 3NF Check: All attributes depend on user_id (primary key)
-- No transitive dependencies (address broken into separate table)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role user_role DEFAULT 'Customer',
    account_status account_status DEFAULT 'Active',
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table 2: addresses (Separate table for 3NF - removes transitive dependency from users)
CREATE TABLE addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address_type VARCHAR(50) DEFAULT 'Home', -- Home, Work, etc.
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All attributes depend on address_id, which depends on user_id
    -- But no transitive dependencies
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Table 3: accounts (Bank accounts)
-- 3NF: All attributes depend on account_id (primary key)
CREATE TABLE accounts (
    account_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_type account_type NOT NULL,
    currency currency_code DEFAULT 'USD',
    balance DECIMAL(15,2) DEFAULT 0.00,
    available_balance DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'Active',
    interest_rate DECIMAL(5,2) DEFAULT 0.00,
    overdraft_limit DECIMAL(15,2) DEFAULT 0.00,
    daily_transaction_limit DECIMAL(15,2) DEFAULT 10000.00,
    monthly_transaction_limit DECIMAL(15,2) DEFAULT 50000.00,
    opened_date DATE DEFAULT CURRENT_DATE,
    closed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- 3NF: All non-key attributes provide facts about the account
    CONSTRAINT positive_balance CHECK (balance >= 0),
    CONSTRAINT valid_account_number CHECK (LENGTH(account_number) >= 10)
);

-- Table 4: transactions (All financial transactions)
-- 3NF: All attributes depend on transaction_id
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    from_account_id INT REFERENCES accounts(account_id),
    to_account_id INT REFERENCES accounts(account_id),
    transaction_type transaction_type NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency currency_code DEFAULT 'USD',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0000,
    description TEXT,
    status transaction_status DEFAULT 'Pending',
    fraud_flag BOOLEAN DEFAULT FALSE,
    fraud_score DECIMAL(3,2) DEFAULT 0.00,
    ip_address INET,
    device_info JSONB,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- 3NF: Amount depends on transaction_id, not on account_id
    CONSTRAINT positive_amount CHECK (amount > 0),
    CONSTRAINT valid_transaction CHECK (
        (from_account_id IS NOT NULL AND to_account_id IS NOT NULL) OR
        (transaction_type IN ('Deposit', 'Withdrawal') AND 
         (from_account_id IS NOT NULL OR to_account_id IS NOT NULL))
    )
);

-- Table 5: fraud_alerts (AI-detected fraud cases)
-- 3NF: All attributes depend on fraud_id
CREATE TABLE fraud_alerts (
    fraud_id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    detected_by VARCHAR(255) NOT NULL, -- AI Model version or rule name
    fraud_type VARCHAR(255) NOT NULL,
    confidence_score DECIMAL(3,2) NOT NULL,
    alert_severity alert_severity DEFAULT 'Medium',
    description TEXT,
    ai_decision_factors JSONB, -- Store ML model decision factors
    reviewed_by INT REFERENCES users(user_id),
    reviewed_at TIMESTAMP,
    status alert_status DEFAULT 'Pending',
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_confidence CHECK (confidence_score BETWEEN 0 AND 1)
);

-- Table 6: beneficiaries (For 3NF - separate from transactions)
CREATE TABLE beneficiaries (
    beneficiary_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    account_number VARCHAR(20) NOT NULL,
    beneficiary_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255),
    bank_code VARCHAR(50),
    nickname VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    max_transfer_limit DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Composite unique constraint
    UNIQUE(user_id, account_number, bank_code)
);

-- Table 7: loans (Separate entity for banking services)
CREATE TABLE loans (
    loan_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    loan_type VARCHAR(50) NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    term_months INT NOT NULL,
    monthly_payment DECIMAL(15,2),
    outstanding_amount DECIMAL(15,2),
    status VARCHAR(20) DEFAULT 'Active',
    approved_date DATE,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 8: cards (Debit/Credit cards)
CREATE TABLE cards (
    card_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    card_number VARCHAR(16) UNIQUE NOT NULL,
    card_type VARCHAR(50) NOT NULL,
    expiry_date DATE NOT NULL,
    cvv VARCHAR(4),
    card_status VARCHAR(20) DEFAULT 'Active',
    daily_limit DECIMAL(15,2) DEFAULT 5000.00,
    is_contactless BOOLEAN DEFAULT TRUE,
    issued_date DATE DEFAULT CURRENT_DATE,
    blocked_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 9: security_logs (Audit trail - for compliance)
CREATE TABLE security_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    status VARCHAR(50),
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 10: notifications (User alerts)
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'Normal',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

-- Table 11: kyc_documents (For regulatory compliance)
CREATE TABLE kyc_documents (
    document_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_number VARCHAR(100),
    file_path VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'Pending',
    verified_by INT REFERENCES users(user_id),
    verified_at TIMESTAMP,
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 12: session_logs (For security monitoring)
CREATE TABLE session_logs (
    session_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(500),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Table 13: system_config (For application settings)
CREATE TABLE system_config (
    config_id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50),
    description TEXT,
    updated_by INT REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 14: ai_models (Track AI model versions)
CREATE TABLE ai_models (
    model_id SERIAL PRIMARY KEY,
    model_name VARCHAR(255) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    algorithm_type VARCHAR(100),
    accuracy_score DECIMAL(5,2),
    precision_score DECIMAL(5,2),
    recall_score DECIMAL(5,2),
    f1_score DECIMAL(5,2),
    training_date TIMESTAMP,
    deployed_date TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    model_path VARCHAR(500),
    parameters JSONB,
    UNIQUE(model_name, model_version)
);

-- Table 15: daily_summaries (For reporting - denormalized but for performance)
CREATE TABLE daily_summaries (
    summary_id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    total_credits DECIMAL(15,2) DEFAULT 0.00,
    total_debits DECIMAL(15,2) DEFAULT 0.00,
    transaction_count INT DEFAULT 0,
    opening_balance DECIMAL(15,2),
    closing_balance DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(account_id, summary_date)
);

-- ============================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_status ON users(account_status);

-- Accounts table indexes
CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_account_number ON accounts(account_number);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_status ON accounts(status);

-- Transactions table indexes
CREATE INDEX idx_transactions_from_account ON transactions(from_account_id);
CREATE INDEX idx_transactions_to_account ON transactions(to_account_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_fraud_flag ON transactions(fraud_flag) WHERE fraud_flag = true;

-- Fraud alerts indexes
CREATE INDEX idx_fraud_alerts_transaction ON fraud_alerts(transaction_id);
CREATE INDEX idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX idx_fraud_alerts_severity ON fraud_alerts(alert_severity);
CREATE INDEX idx_fraud_alerts_created ON fraud_alerts(created_at);

-- Security logs indexes
CREATE INDEX idx_security_logs_user ON security_logs(user_id);
CREATE INDEX idx_security_logs_created ON security_logs(created_at);
CREATE INDEX idx_security_logs_action ON security_logs(action);

-- ============================================
-- STEP 5: CREATE TRIGGERS FOR DATA INTEGRITY
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to accounts table
CREATE TRIGGER update_accounts_updated_at 
    BEFORE UPDATE ON accounts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update account balance after transaction
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Success' THEN
        -- Update from_account balance (debit)
        IF NEW.from_account_id IS NOT NULL THEN
            UPDATE accounts 
            SET balance = balance - NEW.amount,
                available_balance = available_balance - NEW.amount
            WHERE account_id = NEW.from_account_id;
        END IF;
        
        -- Update to_account balance (credit)
        IF NEW.to_account_id IS NOT NULL THEN
            UPDATE accounts 
            SET balance = balance + NEW.amount,
                available_balance = available_balance + NEW.amount
            WHERE account_id = NEW.to_account_id;
        END IF;
        
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_transaction_update
    AFTER UPDATE OF status ON transactions
    FOR EACH ROW
    WHEN (NEW.status = 'Success' AND OLD.status != 'Success')
    EXECUTE FUNCTION update_account_balance();

-- ============================================
-- STEP 6: CREATE VIEWS FOR REPORTING
-- ============================================

-- View for customer summary
CREATE VIEW customer_summary AS
SELECT 
    u.user_id,
    u.full_name,
    u.email,
    COUNT(DISTINCT a.account_id) as total_accounts,
    SUM(a.balance) as total_balance,
    MAX(t.created_at) as last_transaction_date,
    COUNT(DISTINCT t.transaction_id) as transaction_count_30d
FROM users u
LEFT JOIN accounts a ON u.user_id = a.user_id
LEFT JOIN transactions t ON a.account_id IN (t.from_account_id, t.to_account_id)
    AND t.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY u.user_id, u.full_name, u.email;

-- View for fraud analysis
CREATE VIEW fraud_analysis AS
SELECT 
    fa.fraud_id,
    fa.transaction_id,
    fa.fraud_type,
    fa.confidence_score,
    fa.alert_severity,
    fa.status as alert_status,
    t.amount,
    t.created_at as transaction_date,
    u.email as user_email,
    a.account_number
FROM fraud_alerts fa
JOIN transactions t ON fa.transaction_id = t.transaction_id
JOIN accounts a ON t.from_account_id = a.account_id
JOIN users u ON a.user_id = u.user_id;

-- ============================================
-- STEP 7: CREATE USER AND GRANT PERMISSIONS
-- ============================================

-- Create application user (not superuser)
CREATE USER banking_user WITH PASSWORD 'SecurePass123!';

-- Grant necessary permissions
GRANT CONNECT ON DATABASE banking_db TO banking_user;
GRANT USAGE ON SCHEMA public TO banking_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO banking_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO banking_user;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO banking_user;

-- Grant select on views
GRANT SELECT ON customer_summary TO banking_user;
GRANT SELECT ON fraud_analysis TO banking_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public 
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO banking_user;

-- ============================================
-- STEP 8: VERIFY NORMALIZATION
-- ============================================

-- Check 1NF: All tables have primary keys, atomic values
SELECT 
    table_name,
    string_agg(column_name, ', ') as columns
FROM information_schema.columns
WHERE table_schema = 'public'
GROUP BY table_name;

-- Check 3NF: No transitive dependencies
-- (Manual verification - each table should represent a single entity)

-- Show all tables created
\dt

-- Exit PostgreSQL
\q 
