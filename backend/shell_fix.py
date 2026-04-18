from app import db
from sqlalchemy import text
import sys

try:
    # Use raw engine connection to execute DDL
    with db.engine.connect() as conn:
        print("Checking for user_role column...")
        # Check columns
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_role'"))
        if not result.fetchone():
            print("user_role NOT found. Adding it...")
            conn.execute(text("ALTER TABLE users ADD COLUMN user_role VARCHAR(50) DEFAULT 'Customer'"))
            conn.commit()
            print("Successfully added user_role.")
        else:
            print("user_role column already exists.")
            
        # Check accounts table
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'currency'"))
        if not result.fetchone():
            print("currency NOT found in accounts. Adding it...")
            conn.execute(text("ALTER TABLE accounts ADD COLUMN currency VARCHAR(3) DEFAULT 'NGN'"))
            conn.commit()
            print("Successfully added currency.")
            
        result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'accounts' AND column_name = 'daily_limit'"))
        if not result.fetchone():
            print("daily_limit NOT found in accounts. Adding it...")
            conn.execute(text("ALTER TABLE accounts ADD COLUMN daily_limit NUMERIC(15, 2) DEFAULT 10000.00"))
            conn.commit()
            print("Successfully added daily_limit.")
            
except Exception as e:
    print(f"Error during migration: {e}")
    sys.exit(1)

print("Migration check complete.")
