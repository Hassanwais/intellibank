import psycopg2
import os

def check_enum():
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Check transaction_type enum values
        cur.execute("""
            SELECT enumlabel 
            FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
            WHERE pg_type.typname = 'transaction_type';
        """)
        enums = [row[0] for row in cur.fetchall()]
        print(f"Current transaction_type enums: {enums}")
        
        # Check accounts table for Current type
        cur.execute("""
            SELECT enumlabel 
            FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
            WHERE pg_type.typname = 'account_type';
        """)
        acc_enums = [row[0] for row in cur.fetchall()]
        print(f"Current account_type enums: {acc_enums}")
        
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error checking enums: {e}")

if __name__ == "__main__":
    check_enum()
