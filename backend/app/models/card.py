from app import db
from datetime import datetime

class Card(db.Model):
    __tablename__ = 'cards'
    
    card_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.account_id', ondelete='CASCADE'), nullable=False)
    card_number = db.Column(db.String(16), unique=True, nullable=False)
    card_type = db.Column(db.String(50), nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)
    cvv = db.Column(db.String(4))
    card_status = db.Column(db.String(20), default='Active')
    daily_limit = db.Column(db.Numeric(15, 2), default=5000.00)
    is_contactless = db.Column(db.Boolean, default=True)
    issued_date = db.Column(db.Date, default=datetime.utcnow)
    blocked_reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'card_id': self.card_id,
            'account_id': self.account_id,
            'card_number': f"****-****-****-{self.card_number[-4:]}" if self.card_number else None,
            'card_type': self.card_type,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'card_status': self.card_status,
            'daily_limit': float(self.daily_limit) if self.daily_limit else 5000,
            'is_contactless': self.is_contactless,
            'issued_date': self.issued_date.isoformat() if self.issued_date else None,
            'blocked_reason': self.blocked_reason,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
