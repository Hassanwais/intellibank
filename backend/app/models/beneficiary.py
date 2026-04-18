from app import db
from datetime import datetime

class Beneficiary(db.Model):
    __tablename__ = 'beneficiaries'
    
    beneficiary_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    account_number = db.Column(db.String(20), nullable=False)
    beneficiary_name = db.Column(db.String(255), nullable=False)
    bank_name = db.Column(db.String(255))
    bank_code = db.Column(db.String(50))
    nickname = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    max_transfer_limit = db.Column(db.Numeric(15, 2))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'beneficiary_id': self.beneficiary_id,
            'user_id': self.user_id,
            'account_number': self.account_number,
            'beneficiary_name': self.beneficiary_name,
            'bank_name': self.bank_name,
            'bank_code': self.bank_code,
            'nickname': self.nickname,
            'is_active': self.is_active,
            'max_transfer_limit': float(self.max_transfer_limit) if self.max_transfer_limit else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
