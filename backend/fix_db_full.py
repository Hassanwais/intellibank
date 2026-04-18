import psycopg2
import urllib.parse
import os

def fix_schema():
    password = urllib.parse.quote_plus("Admin@123")
    conn_str = f"dbname='banking_db' user='postgres' password='{password}' host='127.0.0.1' port='5433'"
    
    try:
        conn = psycopg2.connect(conn_str)
        cur = conn.cursor()
        
        # Check transaction table
        print("Checking 'transaction' table schema...")
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transaction';
        """)
        columns = [row[0] for row in cur.fetchall()]
        print(f"Current columns in 'transaction': {columns}")
        
        if 'is_fraudulent' not in columns:
            print("Adding 'is_fraudulent' column to 'transaction'...")
            cur.execute("ALTER TABLE transaction ADD COLUMN is_fraudulent BOOLEAN DEFAULT FALSE;")
            print("Column added.")
        
        if 'fraud_score' not in columns:
            print("Adding 'fraud_score' column to 'transaction'...")
            cur.execute("ALTER TABLE transaction ADD COLUMN fraud_score FLOAT DEFAULT 0.0;")
            print("Column added.")

        # Check account table for missing columns
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'account';")
        acc_cols = [row[0] for row in cur.fetchall()]
        if 'account_status' not in acc_cols:
            print("Adding 'account_status' column to 'account'...")
            cur.execute("ALTER TABLE account ADD COLUMN account_status VARCHAR(20) DEFAULT 'Active';")
            print("Column added.")

        conn.commit()
        print("Database schema fixed successfully!")
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error fixing database: {e}")

if __name__ == "__main__":
    fix_schema()
