from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    from app.models.address import Address
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Get primary address
    address = Address.query.filter_by(user_id=user.user_id, is_primary=True).first()
    if not address:
        address = Address.query.filter_by(user_id=user.user_id).first()
        
    user_data = user.to_dict()
    if address:
        user_data['address'] = address.to_dict()
    else:
        user_data['address'] = None
        
    return jsonify({'user': user_data}), 200

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    from flask import request
    from app import db
    from app.models.address import Address
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.get_json()
    
    # Update core user fields
    user.full_name = data.get('full_name', user.full_name)
    user.phone_number = data.get('phone_number', user.phone_number)
    
    # Update address fields if provided
    addr_data = data.get('address')
    if addr_data:
        address = Address.query.filter_by(user_id=user.user_id, is_primary=True).first()
        if not address:
            address = Address.query.filter_by(user_id=user.user_id).first()
            
        if not address:
            # Create new address if none exists
            address = Address(
                user_id=user.user_id,
                address_line1=addr_data.get('address_line1', 'Not specified'),
                city=addr_data.get('city', 'Not specified'),
                state=addr_data.get('state', 'Not specified'),
                postal_code=addr_data.get('postal_code', '000000'),
                country=addr_data.get('country', 'Not specified'),
                is_primary=True
            )
            db.session.add(address)
        else:
            # Update existing address
            address.address_line1 = addr_data.get('address_line1', address.address_line1)
            address.address_line2 = addr_data.get('address_line2', address.address_line2)
            address.city = addr_data.get('city', address.city)
            address.state = addr_data.get('state', address.state)
            address.postal_code = addr_data.get('postal_code', address.postal_code)
            address.country = addr_data.get('country', address.country)
    
    db.session.commit()
    return jsonify({'message': 'Profile and Address updated successfully'}), 200

@users_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    from flask import request
    from app import db
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    if not user.check_password(old_password):
        return jsonify({'error': 'Incorrect current password'}), 400
        
    user.set_password(new_password)
    db.session.commit()
    return jsonify({'message': 'Password changed successfully'}), 200

@users_bp.route('/security-settings', methods=['PUT'])
@jwt_required()
def update_security_settings():
    from flask import request
    from app import db
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    data = request.get_json()
    if 'gmail_app_password' in data:
        user.gmail_app_password = data['gmail_app_password']
    if 'alert_email' in data:
        user.alert_email = data['alert_email']
    if 'alert_phone' in data:
        user.alert_phone = data['alert_phone']
        
    db.session.commit()
    return jsonify({'message': 'Security settings updated successfully'}), 200

@users_bp.route('/security-settings', methods=['GET'])
@jwt_required()
def get_security_settings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'gmail_app_password': user.gmail_app_password,
        'alert_email': user.alert_email,
        'alert_phone': user.alert_phone
    }), 200
