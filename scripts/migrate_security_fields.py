import psycopg2
import os

def migrate():
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    print(f"Connecting to database to migrate users table...")
    
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()
        
        # Add alert_email
        try:
            cur.execute("ALTER TABLE users ADD COLUMN alert_email VARCHAR(255);")
            print("Added column 'alert_email' to users table.")
        except Exception as e:
            print(f"Column 'alert_email' note: {e}")

        # Add gmail_app_password if missing
        try:
            cur.execute("ALTER TABLE users ADD COLUMN gmail_app_password VARCHAR(255);")
            print("Added column 'gmail_app_password' to users table.")
        except Exception as e:
            print(f"Column 'gmail_app_password' note: {e}")

        # Add alert_phone if missing
        try:
            cur.execute("ALTER TABLE users ADD COLUMN alert_phone VARCHAR(50);")
            print("Added column 'alert_phone' to users table.")
        except Exception as e:
            print(f"Column 'alert_phone' note: {e}")
            
        cur.close()
        conn.close()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate()
