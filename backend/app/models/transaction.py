from app import db
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    from_account_id = db.Column(db.Integer, db.ForeignKey('accounts.account_id'), nullable=False)
    to_account_id = db.Column(db.Integer, db.ForeignKey('accounts.account_id'), nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Numeric(15, 2), nullable=False)
    description = db.Column(db.String(255))
    status = db.Column(db.String(20), default='Pending')
    fraud_flag = db.Column(db.Boolean, default=False)
    fraud_score = db.Column(db.Float, default=0.0)
    ip_address = db.Column(db.String(45))
    location = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'transaction_id': self.transaction_id,
            'from_account_id': self.from_account_id,
            'to_account_id': self.to_account_id,
            'transaction_type': self.transaction_type,
            'amount': float(self.amount),
            'description': self.description,
            'status': self.status,
            'fraud_flag': self.fraud_flag,
            'fraud_score': self.fraud_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        } 
