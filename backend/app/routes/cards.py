from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.card import Card
from app.models.account import Account
import random

cards_bp = Blueprint('cards', __name__)

@cards_bp.route('/', methods=['GET'])
@jwt_required()
def get_cards():
    user_id = int(get_jwt_identity())
    accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [acc.account_id for acc in accounts]
    
    if not account_ids:
        return jsonify({'message': 'No accounts found', 'cards': []}), 200
        
    cards = Card.query.filter(Card.account_id.in_(account_ids)).all()
    return jsonify({
        'message': 'Cards retrieved successfully',
        'cards': [card.to_dict() for card in cards]
    }), 200

@cards_bp.route('/request', methods=['POST'])
@jwt_required()
def request_card():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    account_id = data.get('account_id')
    card_type = data.get('card_type', 'Debit')
    
    account = Account.query.filter_by(account_id=account_id, user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Account not found or unauthorized'}), 404
        
    # Generate random card number and CVV
    card_number = ''.join([str(random.randint(0, 9)) for _ in range(16)])
    cvv = ''.join([str(random.randint(0, 9)) for _ in range(3)])
    from datetime import datetime, timedelta
    expiry_date = datetime.utcnow().date() + timedelta(days=365*4) # 4 years
    
    new_card = Card(
        account_id=account_id,
        card_number=card_number,
        card_type=card_type,
        expiry_date=expiry_date,
        cvv=cvv
    )
    
    try:
        db.session.add(new_card)
        db.session.commit()
        return jsonify({
            'message': 'Card requested successfully',
            'card': new_card.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@cards_bp.route('/<int:card_id>/block', methods=['POST'])
@jwt_required()
def block_card(card_id):
    user_id = int(get_jwt_identity())
    data = request.get_json()
    reason = data.get('reason', 'User requested')
    
    # Verify ownership through account
    accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [acc.account_id for acc in accounts]
    
    card = Card.query.filter_by(card_id=card_id).filter(Card.account_id.in_(account_ids)).first()
    if not card:
        return jsonify({'error': 'Card not found or unauthorized'}), 404
        
    card.card_status = 'Blocked'
    card.blocked_reason = reason
    
    db.session.commit()
    return jsonify({
        'message': 'Card blocked successfully',
        'card': card.to_dict()
    }), 200
