from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models.user import User
from app.models.transaction import Transaction
from app.models.fraud_alert import FraudAlert

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    # For now, return basic stats
    stats = {
        'total_users': User.query.count(),
        'total_transactions': Transaction.query.count(),
        'pending_alerts': FraudAlert.query.filter_by(status='Pending').count()
    }
    return jsonify(stats), 200 
