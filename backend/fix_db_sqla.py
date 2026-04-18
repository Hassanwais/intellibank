from app import create_app, db
from sqlalchemy import text
import sys

def run_fix():
    app = create_app()
    with app.app_context():
        try:
            print("Attempting to update schema via SQLAlchemy...")
            
            # Use raw SQL for ALTER TABLE to be safe and simple
            db.session.execute(text("ALTER TABLE \"transactions\" ADD COLUMN IF NOT EXISTS is_fraudulent BOOLEAN DEFAULT FALSE"))
            db.session.execute(text("ALTER TABLE \"transactions\" ADD COLUMN IF NOT EXISTS fraud_score FLOAT DEFAULT 0.0"))
            db.session.execute(text("ALTER TABLE \"transactions\" ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(20) DEFAULT 'Transfer'"))
            db.session.execute(text("ALTER TABLE \"accounts\" ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) DEFAULT 'Active'"))
            
            db.session.commit()
            print("Database schema updated successfully!")
        except Exception as e:
            print(f"Error updating schema: {e}")
            db.session.rollback()
            sys.exit(1)

if __name__ == "__main__":
    run_fix()
