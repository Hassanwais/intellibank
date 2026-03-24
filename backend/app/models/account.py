from app import db
from datetime import datetime

class Account(db.Model):
    __tablename__ = 'accounts'
    
    account_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    account_type = db.Column(db.String(20), nullable=False)
    balance = db.Column(db.Numeric(15, 2), default=0.00)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(20), default='Active')
    interest_rate = db.Column(db.Numeric(5, 2), default=0.00)
    daily_transaction_limit = db.Column(db.Numeric(15, 2), default=10000.00)
    monthly_transaction_limit = db.Column(db.Numeric(15, 2), default=50000.00)
    opened_date = db.Column(db.Date, default=datetime.utcnow)
    closed_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    transactions_from = db.relationship('Transaction', 
                                       foreign_keys='Transaction.from_account_id',
                                       backref='from_account', lazy=True)
    transactions_to = db.relationship('Transaction',
                                     foreign_keys='Transaction.to_account_id',
                                     backref='to_account', lazy=True)
    
    def to_dict(self):
        return {
            'account_id': self.account_id,
            'user_id': self.user_id,
            'account_number': self.account_number,
            'account_type': self.account_type,
            'balance': float(self.balance),
            'currency': self.currency,
            'status': self.status,
            'interest_rate': float(self.interest_rate) if self.interest_rate else 0,
            'opened_date': self.opened_date.isoformat() if self.opened_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
