from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.loan import Loan
from app.models.account import Account

loans_bp = Blueprint('loans', __name__)

@loans_bp.route('/', methods=['GET'])
@jwt_required()
def get_loans():
    user_id = int(get_jwt_identity())
    accounts = Account.query.filter_by(user_id=user_id).all()
    account_ids = [acc.account_id for acc in accounts]
    
    if not account_ids:
        return jsonify({'message': 'No accounts found', 'loans': []}), 200
        
    loans = Loan.query.filter(Loan.account_id.in_(account_ids)).all()
    return jsonify({
        'message': 'Loans retrieved successfully',
        'loans': [loan.to_dict() for loan in loans]
    }), 200

@loans_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_loan():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    account_id = data.get('account_id')
    loan_type = data.get('loan_type')
    principal_amount = data.get('principal_amount')
    term_months = data.get('term_months')
    
    if not all([account_id, loan_type, principal_amount, term_months]):
        return jsonify({'error': 'Missing required fields'}), 400
        
    account = Account.query.filter_by(account_id=account_id, user_id=user_id).first()
    if not account:
        return jsonify({'error': 'Account not found or unauthorized'}), 404
        
    # Basic logic for interest and payment
    interest_rate = 5.0 # Fixed for simplicity
    monthly_payment = (float(principal_amount) * (1 + interest_rate/100)) / int(term_months)
    
    new_loan = Loan(
        account_id=account_id,
        loan_type=loan_type,
        principal_amount=principal_amount,
        interest_rate=interest_rate,
        term_months=term_months,
        monthly_payment=monthly_payment,
        outstanding_amount=float(principal_amount) * (1 + interest_rate/100),
        status='Pending Approval'
    )
    
    try:
        db.session.add(new_loan)
        db.session.commit()
        return jsonify({
            'message': 'Loan application submitted successfully',
            'loan': new_loan.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
