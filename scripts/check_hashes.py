import psycopg2
import os

def check_hashes():
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        cur.execute("SELECT email, password_hash FROM users")
        rows = cur.fetchall()
        for row in rows:
            print(f"User: {row[0]}, Hash Prefix: {row[1][:4] if row[1] else 'None'}")
        cur.close()
        conn.close()
    except Exception as e:
        print(e)

if __name__ == "__main__":
    check_hashes()
