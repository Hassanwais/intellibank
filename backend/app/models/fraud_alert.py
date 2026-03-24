from app import db
from datetime import datetime

class FraudAlert(db.Model):
    __tablename__ = 'fraud_alerts'
    
    fraud_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    transaction_id = db.Column(db.Integer, db.ForeignKey('transactions.transaction_id'), nullable=False)
    detected_by = db.Column(db.String(255), nullable=False)
    fraud_type = db.Column(db.String(255), nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    alert_severity = db.Column(db.String(20), default='Medium')
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default='Pending')
    reviewed_by = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    reviewed_at = db.Column(db.DateTime)
    resolution_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'fraud_id': self.fraud_id,
            'transaction_id': self.transaction_id,
            'detected_by': self.detected_by,
            'fraud_type': self.fraud_type,
            'confidence_score': self.confidence_score,
            'alert_severity': self.alert_severity,
            'description': self.description,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
