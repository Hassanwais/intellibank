"""
Account Management Routes
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.account import Account
from app.models.transaction import Transaction
from datetime import datetime, timedelta
import random
import logging

logger = logging.getLogger(__name__)
accounts_bp = Blueprint('accounts', __name__)

def generate_account_number():
    """Generate a unique account number."""
    while True:
        account_number = f"ACC{random.randint(1000000000, 9999999999)}"
        existing = Account.query.filter_by(account_number=account_number).first()
        if not existing:
            return account_number

@accounts_bp.route('/', methods=['GET'])
@jwt_required()
def get_accounts():
    """Get all accounts for the authenticated user."""
    try:
        current_user_id = int(get_jwt_identity())
        accounts = Account.query.filter_by(user_id=current_user_id).all()
        
        accounts_list = []
        for acc in accounts:
            accounts_list.append({
                'account_id': acc.account_id,
                'user_id': acc.user_id,
                'account_number': acc.account_number,
                'account_type': acc.account_type,
                'balance': float(acc.balance) if acc.balance else 0,
                'currency': acc.currency,
                'status': acc.status,
                'daily_limit': float(acc.daily_limit) if acc.daily_limit else 10000,
                'opened_date': acc.opened_date.isoformat() if acc.opened_date else None,
                'created_at': acc.created_at.isoformat() if acc.created_at else None
            })
        
        return jsonify({'accounts': accounts_list}), 200
    except Exception as e:
        logger.error(f"Error fetching accounts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/', methods=['POST'])
@jwt_required()
def create_account():
    """Create a new account."""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        account_type = data.get('account_type', 'Checking').capitalize()
        currency = data.get('currency', 'USD')
        initial_deposit_raw = data.get('initial_deposit', 0)
        initial_deposit = float(initial_deposit_raw) if initial_deposit_raw and str(initial_deposit_raw).strip() != '' else 0.0
        
        logger.info(f"Attempting to create account: ID={current_user_id}, Type='{account_type}', Currency='{currency}'")
        
        # Validate account type
        valid_types = ['Checking', 'Savings', 'Business', 'Current']
        if account_type not in valid_types:
            return jsonify({'error': f'Invalid account type. Got "{account_type}". Must be one of: {", ".join(valid_types)}'}), 400
        
        # Generate unique account number
        account_number = generate_account_number()
        
        # Create account
        new_account = Account(
            user_id=current_user_id,
            account_number=account_number,
            account_type=account_type,
            currency=currency,
            balance=initial_deposit,
            status='Active',
            daily_limit=1000000.00,
            opened_date=datetime.utcnow().date(),
            created_at=datetime.utcnow()
        )
        
        db.session.add(new_account)
        db.session.flush()
        
        # If there's an initial deposit, create a transaction record
        if initial_deposit > 0:
            transaction = Transaction(
                from_account_id=new_account.account_id,
                to_account_id=new_account.account_id,
                transaction_type='Deposit',
                amount=initial_deposit,
                description='Initial deposit',
                status='Success',
                created_at=datetime.utcnow(),
                completed_at=datetime.utcnow()
            )
            db.session.add(transaction)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Account created successfully',
            'account': {
                'account_id': new_account.account_id,
                'account_number': new_account.account_number,
                'account_type': new_account.account_type,
                'balance': float(new_account.balance),
                'currency': new_account.currency,
                'status': new_account.status,
                'daily_limit': float(new_account.daily_limit),
                'opened_date': new_account.opened_date.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error creating account: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>', methods=['GET'])
@jwt_required()
def get_account(account_id):
    """Get a specific account."""
    try:
        current_user_id = int(get_jwt_identity())
        
        account = Account.query.get(account_id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        if account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({
            'account': {
                'account_id': account.account_id,
                'user_id': account.user_id,
                'account_number': account.account_number,
                'account_type': account.account_type,
                'balance': float(account.balance),
                'currency': account.currency,
                'status': account.status,
                'daily_limit': float(account.daily_limit),
                'opened_date': account.opened_date.isoformat() if account.opened_date else None,
                'created_at': account.created_at.isoformat() if account.created_at else None
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching account: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>', methods=['PUT'])
@jwt_required()
def update_account(account_id):
    """Update account settings."""
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        account = Account.query.get(account_id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        if account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update daily limit if provided
        if 'daily_limit' in data:
            new_limit = float(data['daily_limit'])
            if new_limit <= 0:
                return jsonify({'error': 'Daily limit must be positive'}), 400
            account.daily_limit = new_limit
        
        # Update status if provided
        if 'status' in data:
            valid_status = ['Active', 'Frozen', 'Closed']
            if data['status'] not in valid_status:
                return jsonify({'error': f'Invalid status. Must be one of: {valid_status}'}), 400
            account.status = data['status']
        
        account.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Account updated successfully',
            'account': {
                'account_id': account.account_id,
                'account_number': account.account_number,
                'account_type': account.account_type,
                'balance': float(account.balance),
                'status': account.status,
                'daily_limit': float(account.daily_limit)
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating account: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>/transactions', methods=['GET'])
@jwt_required()
def get_account_transactions(account_id):
    """Get transactions for a specific account."""
    try:
        current_user_id = int(get_jwt_identity())
        
        account = Account.query.get(account_id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        if account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Get query parameters for pagination
        limit = min(int(request.args.get('limit', 20)), 100)
        offset = int(request.args.get('offset', 0))
        
        # Get transactions
        transactions = Transaction.query.filter(
            (Transaction.from_account_id == account_id) |
            (Transaction.to_account_id == account_id)
        ).order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()
        
        total = Transaction.query.filter(
            (Transaction.from_account_id == account_id) |
            (Transaction.to_account_id == account_id)
        ).count()
        
        transactions_list = []
        for tx in transactions:
            # Determine direction relative to this account
            direction = 'incoming' if tx.to_account_id == account_id else 'outgoing'
            
            transactions_list.append({
                'transaction_id': tx.transaction_id,
                'from_account_id': tx.from_account_id,
                'to_account_id': tx.to_account_id,
                'transaction_type': tx.transaction_type,
                'amount': float(tx.amount),
                'description': tx.description,
                'status': tx.status,
                'fraud_flag': tx.fraud_flag,
                'fraud_score': float(tx.fraud_score) if tx.fraud_score else 0,
                'direction': direction,
                'reference_number': tx.reference_number,
                'created_at': tx.created_at.isoformat() if tx.created_at else None,
                'completed_at': tx.completed_at.isoformat() if tx.completed_at else None
            })
        
        return jsonify({
            'transactions': transactions_list,
            'pagination': {
                'total': total,
                'limit': limit,
                'offset': offset,
                'has_more': offset + limit < total
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({'error': str(e)}), 500

@accounts_bp.route('/<int:account_id>/statement', methods=['GET'])
@jwt_required()
def generate_statement(account_id):
    """Generate account statement (PDF/CSV)."""
    try:
        current_user_id = int(get_jwt_identity())
        from_date = request.args.get('from_date')
        to_date = request.args.get('to_date')
        format_type = request.args.get('format', 'pdf')
        
        account = Account.query.get(account_id)
        if not account:
            return jsonify({'error': 'Account not found'}), 404
        
        if account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Parse dates
        start_date = datetime.strptime(from_date, '%Y-%m-%d') if from_date else datetime.utcnow() - timedelta(days=30)
        end_date = datetime.strptime(to_date, '%Y-%m-%d') if to_date else datetime.utcnow()
        
        # Get transactions in date range
        transactions = Transaction.query.filter(
            (Transaction.from_account_id == account_id) |
            (Transaction.to_account_id == account_id),
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date + timedelta(days=1),
            Transaction.status == 'Success'
        ).order_by(Transaction.created_at).all()
        
        if format_type == 'csv':
            # Generate CSV
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            writer.writerow(['Date', 'Description', 'Type', 'Amount', 'Balance'])
            
            running_balance = account.balance - sum(t.amount if t.to_account_id == account_id else -t.amount for t in transactions)
            for tx in transactions:
                if tx.to_account_id == account_id:
                    amount = tx.amount
                    running_balance += amount
                    writer.writerow([
                        tx.created_at.strftime('%Y-%m-%d %H:%M'),
                        tx.description or tx.transaction_type,
                        'Credit',
                        f"{amount:.2f}",
                        f"{running_balance:.2f}"
                    ])
                else:
                    amount = -tx.amount
                    running_balance += amount
                    writer.writerow([
                        tx.created_at.strftime('%Y-%m-%d %H:%M'),
                        tx.description or tx.transaction_type,
                        'Debit',
                        f"{-amount:.2f}",
                        f"{running_balance:.2f}"
                    ])
            
            output.seek(0)
            from flask import send_file
            return send_file(
                io.BytesIO(output.getvalue().encode('utf-8')),
                mimetype='text/csv',
                as_attachment=True,
                download_name=f"statement_{account.account_number}_{from_date}_to_{to_date}.csv"
            )
        else:
            # For PDF, we'll return a simple JSON with data
            # Full PDF generation would require reportlab
            return jsonify({
                'message': 'PDF generation not fully implemented',
                'data': {
                    'account': account.account_number,
                    'account_type': account.account_type,
                    'from_date': start_date.isoformat(),
                    'to_date': end_date.isoformat(),
                    'opening_balance': float(account.balance),
                    'transactions': [{
                        'date': tx.created_at.isoformat(),
                        'description': tx.description or tx.transaction_type,
                        'amount': float(tx.amount),
                        'type': 'Credit' if tx.to_account_id == account_id else 'Debit'
                    } for tx in transactions]
                }
            }), 200
        
    except Exception as e:
        logger.error(f"Error generating statement: {str(e)}")
        return jsonify({'error': str(e)}), 500