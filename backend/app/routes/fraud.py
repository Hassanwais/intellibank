from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.transaction import Transaction
from app.models.account import Account
from app.models.fraud_alert import FraudAlert
from app.ai.real_time_detector import get_detector
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)
fraud_bp = Blueprint('fraud', __name__)

# Initialize fraud detector
detector = get_detector()

@fraud_bp.route('/analyze', methods=['POST'])
@jwt_required()
def analyze_transaction():
    """Analyze a transaction for fraud risk"""
    try:
        data = request.get_json()
        transaction_id = data.get('transaction_id')
        
        if not transaction_id:
            return jsonify({'error': 'Transaction ID required'}), 400
        
        # Get transaction from database
        transaction = Transaction.query.get(transaction_id)
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        # Get associated accounts
        from_account = Account.query.get(transaction.from_account_id)
        
        # Calculate additional features for AI model
        account_age_days = 0
        if from_account and from_account.created_at:
            account_age_days = (datetime.utcnow() - from_account.created_at).days
        
        # Get user's transaction history for context
        recent_transactions = Transaction.query.filter(
            (Transaction.from_account_id == from_account.account_id) |
            (Transaction.to_account_id == from_account.account_id)
        ).order_by(Transaction.created_at.desc()).limit(30).all()
        
        # Calculate average transaction amount (last 30 days)
        avg_amount = 0
        tx_count_24h = 0
        if recent_transactions:
            amounts = [float(t.amount) for t in recent_transactions if t.amount]
            avg_amount = sum(amounts) / len(amounts) if amounts else 100
            
            # Count transactions in last 24 hours
            day_ago = datetime.utcnow() - timedelta(days=1)
            tx_count_24h = sum(1 for t in recent_transactions if t.created_at > day_ago)
        
        # Prepare data for AI model
        transaction_data = {
            'transaction_id': transaction.transaction_id,
            'amount': float(transaction.amount),
            'timestamp': transaction.created_at,
            'transaction_type': transaction.transaction_type,
            'account_age_days': account_age_days or 365,
            'avg_transaction_amount_30d': avg_amount,
            'transaction_count_24h': tx_count_24h,
            'distance_from_home': data.get('distance_from_home', 0),
            'is_international': data.get('is_international', False)
        }
        
        # Get AI prediction
        result = detector.analyze_transaction(transaction_data)
        
        # Store fraud alert if risk is high
        if result['probability'] > 0.6:
            alert = FraudAlert(
                transaction_id=transaction.transaction_id,
                detected_by='AI Model v1.0',
                fraud_type='Suspicious Activity',
                confidence_score=result['probability'],
                alert_severity=result['risk_level'],
                description=f"AI detected suspicious transaction with {result['probability']:.1%} confidence",
                status='Pending'
            )
            db.session.add(alert)
            db.session.commit()
            
            # Update transaction fraud flag
            transaction.fraud_flag = True
            transaction.fraud_score = result['probability']
            db.session.commit()
        
        return jsonify({
            'success': True,
            'analysis': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error analyzing transaction: {str(e)}")
        return jsonify({'error': str(e)}), 500

@fraud_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_fraud_alerts():
    """Get all fraud alerts for the logged-in user"""
    try:
        current_identity = get_jwt_identity()
        current_user_id = int(current_identity) if current_identity else None
        
        if not current_user_id:
            return jsonify({'error': 'Invalid user identity'}), 401
        
        # Get user's accounts
        accounts = Account.query.filter_by(user_id=current_user_id).all()
        account_ids = [acc.account_id for acc in accounts]
        
        # Get transactions from these accounts
        transactions = Transaction.query.filter(
            (Transaction.from_account_id.in_(account_ids)) |
            (Transaction.to_account_id.in_(account_ids))
        ).all()
        
        transaction_ids = [t.transaction_id for t in transactions]
        
        # Get fraud alerts for these transactions
        alerts = FraudAlert.query.filter(
            FraudAlert.transaction_id.in_(transaction_ids)
        ).order_by(FraudAlert.created_at.desc()).all()
        
        alerts_list = []
        for alert in alerts:
            transaction = Transaction.query.get(alert.transaction_id)
            alerts_list.append({
                'fraud_id': alert.fraud_id,
                'transaction_id': alert.transaction_id,
                'detected_by': alert.detected_by,
                'fraud_type': alert.fraud_type,
                'confidence_score': alert.confidence_score,
                'alert_severity': alert.alert_severity,
                'description': alert.description,
                'status': alert.status,
                'created_at': alert.created_at.isoformat() if alert.created_at else None,
                'amount': float(transaction.amount) if transaction else 0,
                'transaction_date': transaction.created_at.isoformat() if transaction else None
            })
        
        return jsonify({'alerts': alerts_list}), 200
        
    except Exception as e:
        logger.error(f"Error fetching fraud alerts: {str(e)}")
        return jsonify({'error': str(e)}), 500

@fraud_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
@jwt_required()
def update_alert(alert_id):
    """Update fraud alert status (reviewed, false positive, etc.)"""
    try:
        data = request.get_json()
        status = data.get('status')
        resolution_notes = data.get('resolution_notes', '')
        
        alert = FraudAlert.query.get(alert_id)
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        alert.status = status
        alert.resolution_notes = resolution_notes
        alert.reviewed_at = datetime.utcnow()
        
        # Get current user ID for reviewer
        current_identity = get_jwt_identity()
        alert.reviewed_by = int(current_identity) if current_identity else None
        
        db.session.commit()
        
        return jsonify({'message': 'Alert updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"Error updating alert: {str(e)}")
        return jsonify({'error': str(e)}), 500

@fraud_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_fraud_stats():
    """Get fraud detection statistics for the user"""
    try:
        current_identity = get_jwt_identity()
        current_user_id = int(current_identity) if current_identity else None
        
        if not current_user_id:
            return jsonify({'error': 'Invalid user identity'}), 401
        
        # Get user's accounts
        accounts = Account.query.filter_by(user_id=current_user_id).all()
        account_ids = [acc.account_id for acc in accounts]
        
        # Get transactions
        transactions = Transaction.query.filter(
            (Transaction.from_account_id.in_(account_ids)) |
            (Transaction.to_account_id.in_(account_ids))
        ).all()
        
        total_transactions = len(transactions)
        flagged_transactions = sum(1 for t in transactions if t.fraud_flag)
        
        # Get alerts by severity
        transaction_ids = [t.transaction_id for t in transactions]
        alerts = FraudAlert.query.filter(
            FraudAlert.transaction_id.in_(transaction_ids)
        ).all()
        
        severity_counts = {
            'Low': 0,
            'Medium': 0,
            'High': 0,
            'Critical': 0
        }
        
        for alert in alerts:
            if alert.alert_severity in severity_counts:
                severity_counts[alert.alert_severity] += 1
        
        stats = {
            'total_transactions': total_transactions,
            'flagged_transactions': flagged_transactions,
            'fraud_percentage': (flagged_transactions / total_transactions * 100) if total_transactions > 0 else 0,
            'alerts_by_severity': severity_counts,
            'pending_review': sum(1 for a in alerts if a.status == 'Pending')
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"Error fetching fraud stats: {str(e)}")
        return jsonify({'error': str(e)}), 500