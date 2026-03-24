from .user import User
from .account import Account
from .transaction import Transaction
from .fraud_alert import FraudAlert

# This ensures all models are imported when db.create_all() is called
__all__ = ['User', 'Account', 'Transaction', 'FraudAlert'] 
