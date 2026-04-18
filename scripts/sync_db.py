import psycopg2
import sys
import os

# Database connection details
DB_HOST = "localhost"
DB_PORT = 5433
DB_NAME = "banking_db"
DB_USER = "postgres"
DB_PASS = "Admin@123"

def run_query(cur, query, params=None):
    try:
        cur.execute(query, params)
        return True
    except Exception as e:
        print(f"Query failed: {query}\nError: {e}")
        return False

def sync_db():
    print("Syncing database schema...")
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cur = conn.cursor()
        
        # 1. Accounts table - daily_limit
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='accounts' AND column_name='daily_limit';")
        if not cur.fetchone():
            print("Adding 'daily_limit' to 'accounts'...")
            run_query(cur, "ALTER TABLE accounts ADD COLUMN daily_limit NUMERIC(15, 2) DEFAULT 10000.00;")
        
        # 2. Transactions table - reference_number
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='transactions' AND column_name='reference_number';")
        if not cur.fetchone():
            print("Adding 'reference_number' to 'transactions'...")
            run_query(cur, "ALTER TABLE transactions ADD COLUMN reference_number VARCHAR(50) UNIQUE;")

        # 4. Users table - account_status
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='account_status';")
        if not cur.fetchone():
            print("Adding 'account_status' to 'users'...")
            run_query(cur, "ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'Active';")
        
        # Ensure all existing users are 'Active'
        print("Ensuring all users have 'Active' status...")
        run_query(cur, "UPDATE users SET account_status = 'Active' WHERE account_status IS NULL;")

        # 5. Extend ENUMs for new features
        print("Extending ENUM types for new account and transaction types...")
        # Add 'Current' to account_type
        run_query(cur, "ALTER TYPE account_type ADD VALUE IF NOT EXISTS 'Current';")
        # Add 'Bill Payment' to transaction_type
        run_query(cur, "ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'Bill Payment';")
        # Add 'Blocked' to transaction_status
        run_query(cur, "ALTER TYPE transaction_status ADD VALUE IF NOT EXISTS 'Blocked';")

        # 6. Increase Transaction Limits
        print("Increasing transaction limits to 1,000,000...")
        run_query(cur, "ALTER TABLE accounts ALTER COLUMN daily_limit SET DEFAULT 1000000.00;")
        run_query(cur, "UPDATE accounts SET daily_limit = 1000000.00 WHERE daily_limit < 1000000.00;")

        # 7. Check for fraud_alerts table
        cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fraud_alerts');")
        if not cur.fetchone()[0]:
            print("Creating 'fraud_alerts' table...")
            run_query(cur, """
                CREATE TABLE fraud_alerts (
                    fraud_id SERIAL PRIMARY KEY,
                    transaction_id INTEGER REFERENCES transactions(transaction_id) NOT NULL,
                    detected_by VARCHAR(255) NOT NULL,
                    fraud_type VARCHAR(255) NOT NULL,
                    confidence_score FLOAT NOT NULL,
                    alert_severity VARCHAR(20) DEFAULT 'Medium',
                    description TEXT,
                    status VARCHAR(20) DEFAULT 'Pending',
                    reviewed_by INTEGER REFERENCES users(user_id),
                    reviewed_at TIMESTAMP,
                    resolution_notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

        conn.commit()
        print("Database sync completed successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Fatal error during DB sync: {e}")
        sys.exit(1)

if __name__ == "__main__":
    sync_db()
