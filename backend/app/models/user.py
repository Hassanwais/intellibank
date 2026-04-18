from app import db
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_role = db.Column(db.String(50), default='Customer')
    account_status = db.Column(db.String(20), default='Active')
    email_verified = db.Column(db.Boolean, default=False)
    phone_verified = db.Column(db.Boolean, default=False)
    two_factor_enabled = db.Column(db.Boolean, default=False)
    gmail_app_password = db.Column(db.String(255), nullable=True) # For real-time email alerts
    alert_email = db.Column(db.String(255), nullable=True) # Destination for security alerts
    alert_phone = db.Column(db.String(50), nullable=True) # For real-time SMS alerts
    last_login = db.Column(db.DateTime)
    failed_login_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    accounts = db.relationship('Account', backref='user', lazy=True, cascade='all, delete-orphan')
    addresses = db.relationship('Address', backref='user', lazy=True, cascade='all, delete-orphan')
    beneficiaries = db.relationship('Beneficiary', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'full_name': self.full_name,
            'email': self.email,
            'phone_number': self.phone_number,
            'user_role': self.user_role,
            'account_status': self.account_status,
            'email_verified': self.email_verified,
            'phone_verified': self.phone_verified,
            'two_factor_enabled': self.two_factor_enabled,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        } 
