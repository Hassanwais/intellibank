import psycopg2
import os
from dotenv import load_dotenv

def fix_transaction_table():
    # Connection details from docker-compose/env
    # We use the host-mapped port 5433 for local access if running outside docker
    # But if we run this via 'docker exec', we use 'db:5432'
    
    # Let's try to connect using the environment variables
    # Since we are likely running this on the host, we use localhost:5433
    
    db_url = "postgresql://postgres:Admin@123@localhost:5433/banking_db"
    
    # We need to URL-encode the @ in the password if using a string, 
    # but psycopg2.connect can take parameters directly
    
    try:
        print("Connecting to PostgreSQL...")
        conn = psycopg2.connect(
            host="localhost",
            port=5433,
            user="postgres",
            password="Admin@123",
            database="banking_db"
        )
        cur = conn.cursor()
        
        # Check if column exists
        cur.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='transactions' AND column_name='reference_number';
        """)
        
        if cur.fetchone():
            print("Column 'reference_number' already exists.")
        else:
            print("Adding column 'reference_number' to 'transactions' table...")
            cur.execute("ALTER TABLE transactions ADD COLUMN reference_number VARCHAR(50) UNIQUE;")
            conn.commit()
            print("Column added successfully!")
            
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_transaction_table()
