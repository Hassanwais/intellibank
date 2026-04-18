import psycopg2
try:
    conn=psycopg2.connect(dbname='banking_db', user='postgres', password='Admin@123', host='localhost', port='5433')
    cur=conn.cursor()
    
    # Check nullability
    cur.execute("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'to_account_id';")
    print("to_account_id nullability:", cur.fetchall())
    
    # Check if a dummy system account exists to use for Bill Payments
    cur.execute("SELECT account_id FROM accounts WHERE account_number = 'SYSTEM_BILLS';")
    result = cur.fetchone()
    if not result:
        print("SYSTEM_BILLS account missing. Will create one.")
        # We might need a dummy account to satisfy foreign keys if they are NOT NULL
    else:
        print("SYSTEM_BILLS account exists:", result[0])
        
    cur.close()
    conn.close()
except Exception as e:
    print(e)
