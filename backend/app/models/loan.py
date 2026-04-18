from app import db
from datetime import datetime

class Loan(db.Model):
    __tablename__ = 'loans'
    
    loan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.account_id', ondelete='CASCADE'), nullable=False)
    loan_type = db.Column(db.String(50), nullable=False)
    principal_amount = db.Column(db.Numeric(15, 2), nullable=False)
    interest_rate = db.Column(db.Numeric(5, 2), nullable=False)
    term_months = db.Column(db.Integer, nullable=False)
    monthly_payment = db.Column(db.Numeric(15, 2))
    outstanding_amount = db.Column(db.Numeric(15, 2))
    status = db.Column(db.String(20), default='Active')
    approved_date = db.Column(db.Date)
    due_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'loan_id': self.loan_id,
            'account_id': self.account_id,
            'loan_type': self.loan_type,
            'principal_amount': float(self.principal_amount) if self.principal_amount else 0,
            'interest_rate': float(self.interest_rate) if self.interest_rate else 0,
            'term_months': self.term_months,
            'monthly_payment': float(self.monthly_payment) if self.monthly_payment else None,
            'outstanding_amount': float(self.outstanding_amount) if self.outstanding_amount else None,
            'status': self.status,
            'approved_date': self.approved_date.isoformat() if self.approved_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
