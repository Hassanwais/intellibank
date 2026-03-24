from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.fraud_alert import FraudAlert
from app.models.transaction import Transaction
from app import db

fraud_bp = Blueprint('fraud', __name__)

@fraud_bp.route('/alerts', methods=['GET'])
@jwt_required()
def get_alerts():
    current_user_id = get_jwt_identity()
    # For now, return empty list (will implement with AI later)
    return jsonify({'alerts': []}), 200

@fraud_bp.route('/alerts/<int:alert_id>', methods=['PUT'])
@jwt_required()
def update_alert(alert_id):
    data = request.get_json()
    # For now, just return success
    return jsonify({'message': 'Alert updated'}), 200 
