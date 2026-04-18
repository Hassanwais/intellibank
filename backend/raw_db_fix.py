import psycopg2
import urllib.parse

password = urllib.parse.quote_plus("Admin@123")
conn_str = f"dbname='banking_db' user='postgres' password='{password}' host='localhost' port='5433'"

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    
    # Check columns of 'users' table
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'users';
    """)
    columns = cur.fetchall()
    print("Columns in 'users' table:")
    for col in columns:
        print(f" - {col[0]} ({col[1]})")
    
    # Check if user_role exists
    if not any(col[0] == 'user_role' for col in columns):
        print("Column 'user_role' is MISSING. Attempting to add it now...")
        cur.execute("ALTER TABLE users ADD COLUMN user_role VARCHAR(50) DEFAULT 'Customer';")
        conn.commit()
        print("ALTER TABLE command executed and committed.")
    else:
        print("Column 'user_role' already EXISTS.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
