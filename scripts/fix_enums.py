import psycopg2
import os
from urllib.parse import urlparse

def fix_enums():
    # Database connection URL from environment or fallback
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    
    print(f"Connecting to database to fix enums...")
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True  # CRITICAL: ALTER TYPE cannot run in a transaction
        cur = conn.cursor()
        
        # 1. Update account_type
        print("Updating 'account_type' enum...")
        try:
            cur.execute("ALTER TYPE account_type ADD VALUE 'Current';")
            print("Added 'Current' to account_type")
        except psycopg2.Error as e:
            print(f"Note: account_type update: {e.pgerror}")

        # 2. Update transaction_type
        print("Updating 'transaction_type' enum...")
        try:
            cur.execute("ALTER TYPE transaction_type ADD VALUE 'Bill Payment';")
            print("Added 'Bill Payment' to transaction_type")
        except psycopg2.Error as e:
            print(f"Note: transaction_type update: {e.pgerror}")

        # 3. Update transaction_status
        print("Updating 'transaction_status' enum...")
        try:
            cur.execute("ALTER TYPE transaction_status ADD VALUE 'Blocked';")
            print("Added 'Blocked' to transaction_status")
        except psycopg2.Error as e:
            print(f"Note: transaction_status update: {e.pgerror}")

        print("\n✅ Database Enums fixed successfully!")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"❌ Error fixing enums: {e}")

if __name__ == "__main__":
    fix_enums()
