import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os

def create_normalized_database():
    # Connect to PostgreSQL
    conn = psycopg2.connect(
        database="postgres",
        user="postgres",
        password="581399@@AJzenith",  # Replace with your postgres password
        host="localhost",
        port="5432"
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cursor = conn.cursor()
    
    # Drop and create database
    cursor.execute("DROP DATABASE IF EXISTS banking_db;")
    cursor.execute("CREATE DATABASE banking_db;")
    
    # Close connection to postgres database
    cursor.close()
    conn.close()
    
    # Connect to new database
    conn = psycopg2.connect(
        database="banking_db",
        user="postgres",
        password="581399@@AJzenith",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    
    # Read and execute schema file
    with open('database/schema.sql', 'r') as f:
        schema = f.read()
        cursor.execute(schema)
    
    conn.commit()
    cursor.close()
    conn.close()
    
    print("✅ Normalized database created successfully!")

if __name__ == "__main__":
    create_normalized_database()