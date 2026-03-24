from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.account import Account
from app.models.transaction import Transaction
from app import db
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

accounts_bp = Blueprint('accounts', __name__)

@accounts_bp.route('/', methods=['GET'])
@jwt_required()
def get_accounts():
    try:
        # Get current user ID from JWT token (returns string, convert to int)
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        logger.info(f"Fetching accounts for user ID: {current_user_id}")
        
        # Query accounts for this user
        accounts = Account.query.filter_by(user_id=current_user_id).all()
        logger.info(f"Found {len(accounts)} accounts")
        
        # Convert to dictionary format
        accounts_list = []
        for account in accounts:
            account_dict = {
                'account_id': account.account_id,
                'user_id': account.user_id,
                'account_number': account.account_number,
                'account_type': account.account_type,
                'balance': float(account.balance) if account.balance else 0,
                'currency': account.currency,
                'status': account.status,
                'interest_rate': float(account.interest_rate) if account.interest_rate else 0,
                'opened_date': account.opened_date.isoformat() if account.opened_date else None,
                'created_at': account.created_at.isoformat() if account.created_at else None
            }
            accounts_list.append(account_dict)
        
        return jsonify({'accounts': accounts_list}), 200
        
    except Exception as e:
        logger.error(f"Error fetching accounts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        
        account = Account.query.get(account_id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # Verify account belongs to user
        if account.user_id != current_user_id:
            logger.warning(f"User {current_user_id} attempted to access account {account_id} belonging to user {account.user_id}")
            return jsonify({'error': 'Unauthorized'}), 403
        
        account_dict = {
            'account_id': account.account_id,
            'user_id': account.user_id,
            'account_number': account.account_number,
            'account_type': account.account_type,
            'balance': float(account.balance) if account.balance else 0,
            'currency': account.currency,
            'status': account.status,
            'interest_rate': float(account.interest_rate) if account.interest_rate else 0,
            'opened_date': account.opened_date.isoformat() if account.opened_date else None,
            'created_at': account.created_at.isoformat() if account.created_at else None
        }
        
        return jsonify({'account': account_dict}), 200
        
    except Exception as e:
        logger.error(f"Error fetching account: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>/transactions', methods=['GET'])
@jwt_required()
def get_account_transactions(account_id):
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        
        account = Account.query.get(account_id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        # Verify account belongs to user
        if account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        transactions = Transaction.query.filter(
            (Transaction.from_account_id == account_id) | 
            (Transaction.to_account_id == account_id)
        ).order_by(Transaction.created_at.desc()).limit(20).all()
        
        transactions_list = []
        for t in transactions:
            t_dict = {
                'transaction_id': t.transaction_id,
                'from_account_id': t.from_account_id,
                'to_account_id': t.to_account_id,
                'transaction_type': t.transaction_type,
                'amount': float(t.amount) if t.amount else 0,
                'description': t.description,
                'status': t.status,
                'fraud_flag': t.fraud_flag,
                'fraud_score': float(t.fraud_score) if t.fraud_score else 0,
                'created_at': t.created_at.isoformat() if t.created_at else None,
                'completed_at': t.completed_at.isoformat() if t.completed_at else None
            }
            transactions_list.append(t_dict)
        
        return jsonify({'transactions': transactions_list}), 200
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/create', methods=['POST'])
@jwt_required()
def create_account():
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        
        data = request.get_json()
        account_type = data.get('account_type', 'Checking')
        
        # Generate unique account number
        import random
        account_number = f"ACC{random.randint(10000000, 99999999)}"
        
        new_account = Account(
            user_id=current_user_id,
            account_number=account_number,
            account_type=account_type,
            balance=0.00,
            currency='USD',
            status='Active'
        )
        
        db.session.add(new_account)
        db.session.commit()
        
        return jsonify({
            'message': 'Account created successfully',
            'account': {
                'account_id': new_account.account_id,
                'account_number': new_account.account_number,
                'account_type': new_account.account_type,
                'balance': float(new_account.balance),
                'currency': new_account.currency,
                'status': new_account.status
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating account: {str(e)}")
        return jsonify({'error': str(e)}), 500