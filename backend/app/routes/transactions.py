from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.transaction import Transaction
from app.models.account import Account
from app import db
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/', methods=['GET'])
@jwt_required()
def get_transactions():
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        
        accounts = Account.query.filter_by(user_id=current_user_id).all()
        account_ids = [acc.account_id for acc in accounts]
        
        transactions = Transaction.query.filter(
            (Transaction.from_account_id.in_(account_ids)) | 
            (Transaction.to_account_id.in_(account_ids))
        ).order_by(Transaction.created_at.desc()).limit(50).all()
        
        transactions_list = []
        for t in transactions:
            t_dict = {
                'transaction_id': t.transaction_id,
                'from_account_id': t.from_account_id,
                'to_account_id': t.to_account_id,
                'transaction_type': t.transaction_type,
                'amount': float(t.amount),
                'description': t.description,
                'status': t.status,
                'fraud_flag': t.fraud_flag,
                'fraud_score': float(t.fraud_score) if t.fraud_score else 0,
                'created_at': t.created_at.isoformat() if t.created_at else None
            }
            transactions_list.append(t_dict)
        
        return jsonify({'transactions': transactions_list}), 200
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/transfer', methods=['POST'])
@jwt_required()
def transfer():
    try:
        data = request.get_json()
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        
        # Validate required fields
        required_fields = ['from_account', 'to_account', 'amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing {field}'}), 400
        
        # Get accounts
        from_account = Account.query.get(data['from_account'])
        if not from_account:
            return jsonify({'error': 'Source account not found'}), 400
            
        # Verify source account belongs to user
        if from_account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Find destination account by account number
        to_account = Account.query.filter_by(account_number=data['to_account']).first()
        if not to_account:
            return jsonify({'error': 'Destination account not found'}), 400
        
        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        
        if float(from_account.balance) < amount:
            return jsonify({'error': 'Insufficient funds'}), 400
        
        # Create transaction
        transaction = Transaction(
            from_account_id=from_account.account_id,
            to_account_id=to_account.account_id,
            transaction_type='Transfer',
            amount=amount,
            description=data.get('description', ''),
            status='Success',
            created_at=datetime.utcnow()
        )
        
        # Update balances
        from_account.balance = float(from_account.balance) - amount
        to_account.balance = float(to_account.balance) + amount
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'message': 'Transfer successful',
            'transaction': {
                'transaction_id': transaction.transaction_id,
                'from_account_id': transaction.from_account_id,
                'to_account_id': transaction.to_account_id,
                'amount': float(transaction.amount),
                'description': transaction.description,
                'status': transaction.status,
                'created_at': transaction.created_at.isoformat() if transaction.created_at else None
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error processing transfer: {str(e)}")
        return jsonify({'error': str(e)}), 500