from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.transaction import Transaction
from app.models.account import Account
from app import db
from datetime import datetime
from app.services.notification_service import NotificationService
from app.models.user import User
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
        
        from app.ai.real_time_detector import get_detector
        detector = get_detector()
        
        # Analyze for fraud
        analysis_data = {
            'amount': amount,
            'transaction_type': 'Transfer',
            'is_international': data.get('is_international', False),
            'distance_from_home': data.get('distance_from_home', 0),
            'timestamp': datetime.utcnow()
        }
        
        fraud_result = detector.analyze_transaction(analysis_data)
        
        # Create transaction
        transaction = Transaction(
            from_account_id=from_account.account_id,
            to_account_id=to_account.account_id,
            transaction_type='Transfer',
            amount=amount,
            description=data.get('description', ''),
            status='Success',
            fraud_flag=fraud_result['requires_review'],
            fraud_score=fraud_result['probability'],
            created_at=datetime.utcnow()
        )
        
        # Update balances if not blocked by high fraud
        # If extremely high risk (>0.9), we accept but set to Blocked for manual review
        if fraud_result['probability'] > 0.9:
            transaction.status = 'Blocked'
        
        db.session.add(transaction)
        db.session.flush() # Ensure transaction_id is populated for FraudAlert
        
        if fraud_result['probability'] > 0.9:
            # Create the FraudAlert immediately with correct model fields
            from app.models.fraud_alert import FraudAlert
            alert = FraudAlert(
                transaction_id=transaction.transaction_id,
                detected_by='AI-Shield v1.2',
                fraud_type='High Risk Transfer',
                confidence_score=float(fraud_result['probability']),
                alert_severity='Critical',
                description=f"Automated Block: {int(fraud_result['probability']*100)}% risk score. Reasons: " + ", ".join(fraud_result.get('reasons', ['Anomalous volume'])),
                status='Pending'
            )
            db.session.add(alert)
            db.session.commit()
            
            # Notify user
            user = User.query.get(current_user_id)
            NotificationService.send_fraud_alert(user, transaction)
            
            return jsonify({
                'message': 'Transaction held for security review by AI-Shield. Please visit your Security Watch to verify.',
                'status': 'Blocked',
                'transaction_id': transaction.transaction_id
            }), 200

        from_account.balance = float(from_account.balance) - amount
        to_account.balance = float(to_account.balance) + amount
        
        db.session.add(transaction)
        
        # If flagged, create a FraudAlert for analysts
        if transaction.fraud_flag:
            from app.models.fraud_alert import FraudAlert
            alert = FraudAlert(
                transaction_id=transaction.transaction_id,
                alert_severity='High' if transaction.fraud_score > 0.8 else 'Medium',
                alert_reason=f"AI Score: {transaction.fraud_score:.2f}. " + ", ".join(fraud_result.get('reasons', [])),
                status='Pending'
            )
            db.session.add(alert)
        
        # Notify user of the transaction
        user = User.query.get(current_user_id)
        if transaction.status == 'Blocked' or transaction.fraud_flag:
            NotificationService.send_fraud_alert(user, transaction)
        else:
            NotificationService.send_notification(
                user, 
                "Transaction Successful", 
                f"Your transfer of NGN {amount:,.2f} to {data['to_account']} was successful."
            )

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

@transactions_bp.route('/bill-payment', methods=['POST'])
@jwt_required()
def bill_payment():
    try:
        data = request.get_json()
        current_user_id = int(get_jwt_identity())

        required_fields = ['from_account', 'amount', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing {field}'}), 400

        from_account = Account.query.get(data['from_account'])
        if not from_account:
            return jsonify({'error': 'Source account not found'}), 400
        if from_account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        amount = float(data['amount'])
        if amount <= 0:
            return jsonify({'error': 'Amount must be positive'}), 400
        if float(from_account.balance) < amount:
            return jsonify({'error': 'Insufficient funds'}), 400

        transaction = Transaction(
            from_account_id=from_account.account_id,
            to_account_id=None,
            transaction_type='Bill Payment',
            amount=amount,
            description=data.get('description', 'Bill Payment'),
            status='Success',
            fraud_flag=False,
            fraud_score=0.0,
            created_at=datetime.utcnow()
        )
        from_account.balance = float(from_account.balance) - amount
        db.session.add(transaction)
        
        # Notify user
        user = User.query.get(current_user_id)
        NotificationService.send_notification(
            user, 
            "Bill Payment Successful", 
            f"Your payment of NGN {amount:,.2f} for {transaction.description} has been processed."
        )

        db.session.commit()

        return jsonify({
            'message': 'Bill payment successful',
            'transaction': {
                'transaction_id': transaction.transaction_id,
                'amount': float(transaction.amount),
                'description': transaction.description,
                'status': transaction.status,
                'created_at': transaction.created_at.isoformat()
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Bill payment error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@transactions_bp.route('/<int:transaction_id>/status', methods=['PUT'])
@jwt_required()
def update_transaction_status(transaction_id):
    try:
        from app.models.user import User
        
        current_user_id = int(get_jwt_identity())
        user = User.query.get(current_user_id)
        if not user or user.user_role != 'Admin':
            return jsonify({'error': 'Unauthorized. Admin access required.'}), 403
            
        data = request.get_json()
        new_status = data.get('status')
        if new_status not in ['Success', 'Failed', 'Blocked']:
            return jsonify({'error': 'Invalid status'}), 400
            
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
            
        # Update the fraud alert if exists
        from app.models.fraud_alert import FraudAlert
        alert = FraudAlert.query.filter_by(transaction_id=transaction_id).first()
        if alert:
            alert.status = 'Resolved' if new_status in ['Success', 'Failed'] else 'Investigating'
            
        # If moving from Blocked to Success, complete the balance transfer
        if transaction.status == 'Blocked' and new_status == 'Success':
            from_account = Account.query.get(transaction.from_account_id)
            to_account = Account.query.get(transaction.to_account_id)
            if from_account and to_account:
                amount = transaction.amount
                if float(from_account.balance) >= amount:
                    from_account.balance = float(from_account.balance) - float(amount)
                    to_account.balance = float(to_account.balance) + float(amount)
                else:
                    return jsonify({'error': 'Insufficient funds for unblocking'}), 400
                    
        transaction.status = new_status
        db.session.commit()
        
        return jsonify({'message': f'Transaction status updated to {new_status}'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating transaction status: {str(e)}")
        return jsonify({'error': str(e)}), 500

@transactions_bp.route('/<int:transaction_id>/user-action', methods=['POST'])
@jwt_required()
def user_transaction_action(transaction_id):
    """
    Allow a user to manually approve or block a transaction flagged as suspicious.
    """
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        action = data.get('action') # 'approve' or 'block'
        
        if action not in ['approve', 'block']:
            return jsonify({'error': 'Invalid action. Use approve or block.'}), 400
            
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
            
        # Verify account ownership
        from app.models.account import Account
        from_account = Account.query.get(transaction.from_account_id)
        if not from_account or from_account.user_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        if transaction.status != 'Blocked' and not transaction.fraud_flag:
            return jsonify({'error': 'This transaction does not require manual action.'}), 400

        if action == 'approve':
            # Complete the transfer
            to_account = Account.query.get(transaction.to_account_id)
            if float(from_account.balance) < float(transaction.amount):
                return jsonify({'error': 'Insufficient funds to complete this transaction.'}), 400
                
            from_account.balance = float(from_account.balance) - float(transaction.amount)
            if to_account:
                to_account.balance = float(to_account.balance) + float(transaction.amount)
            
            transaction.status = 'Success'
            message = "Transaction approved and completed."
        else:
            transaction.status = 'Failed'
            message = "Transaction blocked and cancelled."
            
        # Update alert status if exists
        from app.models.fraud_alert import FraudAlert
        alert = FraudAlert.query.filter_by(transaction_id=transaction.transaction_id).first()
        if alert:
            alert.status = 'Resolved'
            alert.resolution_notes = f"User manually {action}d the transaction."

        db.session.commit()
        return jsonify({
            'message': message, 
            'status': transaction.status,
            'transaction_id': transaction.transaction_id
        }), 200
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error in user transaction action: {str(e)}")
        return jsonify({'error': str(e)}), 500