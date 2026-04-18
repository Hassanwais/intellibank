"""
Account Model Module
"""

from app import db
from datetime import datetime

class Account(db.Model):
    __tablename__ = 'accounts'
    
    account_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    account_type = db.Column(db.String(20), nullable=False)
    currency = db.Column(db.String(3), default='NGN')
    balance = db.Column(db.Numeric(15, 2), default=0.00)
    status = db.Column(db.String(20), default='Active')
    daily_limit = db.Column(db.Numeric(15, 2), default=10000.00)  # Add this line
    opened_date = db.Column(db.Date, default=datetime.utcnow)
    closed_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    loans = db.relationship('Loan', backref='account', lazy=True, cascade='all, delete-orphan')
    cards = db.relationship('Card', backref='account', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'account_id': self.account_id,
            'user_id': self.user_id,
            'account_number': self.account_number,
            'account_type': self.account_type,
            'balance': float(self.balance) if self.balance else 0,
            'currency': self.currency,
            'status': self.status,
            'daily_limit': float(self.daily_limit) if self.daily_limit else 10000,
            'opened_date': self.opened_date.isoformat() if self.opened_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }