import psycopg2
import os

def check_notifications():
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'")
        cols = [row[0] for row in cur.fetchall()]
        print(f"Columns in notifications: {cols}")
        cur.close()
        conn.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_notifications()
