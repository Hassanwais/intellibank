from .user import User
from .account import Account
from .transaction import Transaction
from .fraud_alert import FraudAlert
from .address import Address
from .beneficiary import Beneficiary
from .loan import Loan
from .card import Card

# This ensures all models are imported when db.create_all() is called
__all__ = ['User', 'Account', 'Transaction', 'FraudAlert', 'Address', 'Beneficiary', 'Loan', 'Card']
