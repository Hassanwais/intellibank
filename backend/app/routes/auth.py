from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models.user import User
from app.models.account import Account
from datetime import datetime
import random
import re
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['full_name', 'email', 'phone_number', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(phone_number=data['phone_number']).first():
            return jsonify({'error': 'Phone number already registered'}), 400
        
        # Hash password
        password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        
        # Create new user
        new_user = User(
            full_name=data['full_name'],
            email=data['email'],
            phone_number=data['phone_number'],
            password_hash=password_hash
        )
        
        db.session.add(new_user)
        db.session.flush()  # Get user_id without committing
        
        # Create default checking account
        account_number = f"ACC{random.randint(10000000, 99999999)}"
        
        new_account = Account(
            user_id=new_user.user_id,
            account_number=account_number,
            account_type='Checking',
            balance=1000.00,  # Welcome bonus
            currency='NGN',
            status='Active'
        )
        
        db.session.add(new_account)
        db.session.commit()
        
        # Generate tokens with identity object (loader will handle string conversion)
        access_token = create_access_token(identity=new_user)
        refresh_token = create_refresh_token(identity=new_user)
        
        logger.info(f"Successful registration for user: {new_user.email}")
        
        return jsonify({
            'message': 'Registration successful',
            'user': new_user.to_dict(),
            'account': new_account.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password required'}), 400
        
        # Find user
        user = User.query.filter_by(email=data['email']).first()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password using Optimized Hybrid Authentication
        is_valid = False
        try:
            password_hash = user.password_hash or ""
            if password_hash.startswith(('$2b$', '$2a$', '$2y$')):
                # Use Bcrypt only for Bcrypt hashes to avoid long CPU hangs
                is_valid = bcrypt.check_password_hash(password_hash, data['password'])
            else:
                # Optimized fallback to Werkzeug for Scrypt/PBKDF2
                from werkzeug.security import check_password_hash
                is_valid = check_password_hash(password_hash, data['password'])
        except Exception as e:
            logger.error(f"Instant verification fail-safe for {user.email}: {str(e)}")
            return jsonify({'error': 'Security check failed. Please try again.'}), 401
            
        if not is_valid:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check account status
        if user.account_status != 'Active':
            return jsonify({'error': 'Account is not active. Please contact support.'}), 403
        
        # Generate tokens with identity object (loader will handle string conversion)
        access_token = create_access_token(identity=user)
        refresh_token = create_refresh_token(identity=user)
        
        logger.info(f"Successful login for user: {user.email}")
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user_id_str = get_jwt_identity()  # Returns string
    access_token = create_access_token(identity=current_user_id_str)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        current_user_id_str = get_jwt_identity()
        current_user_id = int(current_user_id_str)
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500