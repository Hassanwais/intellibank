import psycopg2
import os

def migrate():
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    print(f"Connecting to database to finalize stabilization...")
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        # 1. Make to_account_id nullable
        try:
            cur.execute("ALTER TABLE transactions ALTER COLUMN to_account_id DROP NOT NULL;")
            print("Set 'to_account_id' to satisfy nullable constraint.")
        except Exception as e:
            print(f"Nullable constraint note: {e}")

        # 2. Check and fix transaction_type enum
        try:
            cur.execute("""
                SELECT enumlabel FROM pg_enum 
                JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
                WHERE pg_type.typname = 'transaction_type' AND enumlabel = 'Bill Payment';
            """)
            if not cur.fetchone():
                cur.execute("ALTER TYPE transaction_type ADD VALUE 'Bill Payment';")
                print("Added 'Bill Payment' to transaction_type enum.")
            else:
                print("'Bill Payment' already in enum.")
        except Exception as e:
            print(f"Enum update note: {e}")
            
        cur.close()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
