from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.beneficiary import Beneficiary

beneficiaries_bp = Blueprint('beneficiaries', __name__)

@beneficiaries_bp.route('/', methods=['GET'])
@jwt_required()
def get_beneficiaries():
    user_id = int(get_jwt_identity())
    beneficiaries = Beneficiary.query.filter_by(user_id=user_id, is_active=True).all()
    return jsonify({
        'message': 'Beneficiaries retrieved successfully',
        'beneficiaries': [b.to_dict() for b in beneficiaries]
    }), 200

@beneficiaries_bp.route('/add', methods=['POST'])
@jwt_required()
def add_beneficiary():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    account_number = data.get('account_number')
    beneficiary_name = data.get('beneficiary_name')
    bank_name = data.get('bank_name')
    nickname = data.get('nickname')
    max_transfer_limit = data.get('max_transfer_limit')
    
    if not all([account_number, beneficiary_name]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    # Check if already exists
    existing = Beneficiary.query.filter_by(
        user_id=user_id, 
        account_number=account_number, 
        is_active=True
    ).first()
    
    if existing:
        return jsonify({'error': 'Beneficiary already exists'}), 400
        
    new_beneficiary = Beneficiary(
        user_id=user_id,
        account_number=account_number,
        beneficiary_name=beneficiary_name,
        bank_name=bank_name,
        nickname=nickname,
        max_transfer_limit=max_transfer_limit
    )
    
    try:
        db.session.add(new_beneficiary)
        db.session.commit()
        return jsonify({
            'message': 'Beneficiary added successfully',
            'beneficiary': new_beneficiary.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@beneficiaries_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_beneficiary(id):
    user_id = int(get_jwt_identity())
    
    beneficiary = Beneficiary.query.filter_by(beneficiary_id=id, user_id=user_id).first()
    if not beneficiary:
        return jsonify({'error': 'Beneficiary not found'}), 404
        
    beneficiary.is_active = False # Soft delete
    db.session.commit()
    
    return jsonify({'message': 'Beneficiary removed successfully'}), 200
