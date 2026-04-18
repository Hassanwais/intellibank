from app import create_app, db
from app.models.account import Account
from app.models.transaction import Transaction
from datetime import datetime
import traceback

app = create_app()
with app.app_context():
    try:
        new_acc = Account(
            user_id=1, 
            account_number='1234567890', 
            account_type='Checking', 
            currency='USD', 
            balance=100.0, 
            status='Active', 
            daily_limit=10000.0, 
            opened_date=datetime.utcnow().date(), 
            created_at=datetime.utcnow()
        )
        db.session.add(new_acc)
        db.session.flush()
        
        trans = Transaction(
            from_account_id=new_acc.account_id, 
            to_account_id=new_acc.account_id, 
            transaction_type='Deposit', 
            amount=100.0, 
            description='Init', 
            status='Success', 
            created_at=datetime.utcnow(), 
            completed_at=datetime.utcnow()
        )
        db.session.add(trans)
        db.session.commit()
        print('Success!')
    except Exception as e:
        db.session.rollback()
        print('ERROR:')
        traceback.print_exc()
