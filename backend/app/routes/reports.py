"""
Report Routes Module
Provides API endpoints for report generation and download.
"""

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from app.services.report_service import ReportService

reports_bp = Blueprint('reports', __name__)
report_service = ReportService()

@reports_bp.route('/monthly-statement', methods=['GET'])
@jwt_required()
def get_monthly_statement():
    """
    Generate monthly account statement.
    
    Query Parameters:
        account_id: Account ID
        year: Year (YYYY)
        month: Month (1-12)
        format: pdf or csv (default: pdf)
    """
    user_id = int(get_jwt_identity())
    account_id = request.args.get('account_id', type=int)
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    format_type = request.args.get('format', 'pdf').lower()
    
    if not all([account_id, year, month]):
        return jsonify({'error': 'account_id, year, and month are required'}), 400
    
    # Verify account belongs to user
    from app.models.account import Account
    account = Account.query.get(account_id)
    if not account or account.user_id != user_id:
        return jsonify({'error': 'Account not found'}), 404
    
    try:
        file_data = report_service.generate_monthly_statement(
            user_id, account_id, year, month, format_type
        )
        
        filename = f"statement_{account.account_number}_{year}_{month:02d}.{format_type}"
        mimetype = 'application/pdf' if format_type == 'pdf' else 'text/csv'
        
        return send_file(
            file_data,
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/fraud-summary', methods=['GET'])
@jwt_required()
def get_fraud_summary():
    """
    Generate fraud detection summary report.
    
    Query Parameters:
        from_date: Start date (YYYY-MM-DD)
        to_date: End date (YYYY-MM-DD)
        format: pdf or csv (default: pdf)
    """
    user_id = int(get_jwt_identity())
    
    # Only admins and fraud analysts can access fraud reports
    from app.auth.rbac import has_role
    if not has_role(user_id, ['admin', 'fraud_analyst']):
        return jsonify({'error': 'Unauthorized'}), 403
    
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    format_type = request.args.get('format', 'pdf').lower()
    
    if not from_date:
        from_date = (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d')
    if not to_date:
        to_date = datetime.utcnow().strftime('%Y-%m-%d')
    
    start_date = datetime.strptime(from_date, '%Y-%m-%d')
    end_date = datetime.strptime(to_date, '%Y-%m-%d') + timedelta(days=1)
    
    try:
        file_data = report_service.generate_fraud_summary(
            start_date, end_date, format_type
        )
        
        filename = f"fraud_summary_{from_date}_to_{to_date}.{format_type}"
        mimetype = 'application/pdf' if format_type == 'pdf' else 'text/csv'
        
        return send_file(
            file_data,
            mimetype=mimetype,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@reports_bp.route('/performance-audit', methods=['GET'])
@jwt_required()
def get_performance_audit():
    """
    Generate system performance audit report.
    Only accessible by system administrators.
    """
    user_id = int(get_jwt_identity())
    
    from app.auth.rbac import has_role
    if not has_role(user_id, ['admin', 'super_admin']):
        return jsonify({'error': 'Unauthorized'}), 403
    
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    format_type = request.args.get('format', 'pdf').lower()
    
    if not from_date:
        from_date = (datetime.utcnow() - timedelta(days=30)).strftime('%Y-%m-%d')
    if not to_date:
        to_date = datetime.utcnow().strftime('%Y-%m-%d')
    
    # Implementation for performance audit report
    # (Similar structure to other report endpoints)
    
    return jsonify({'message': 'Report generation in development'}), 200

@reports_bp.route('/suspicious-activity', methods=['GET'])
@jwt_required()
def get_suspicious_activity():
    """
    Generate Suspicious Activity Report (SAR) for regulatory compliance.
    Only accessible by compliance officers and auditors.
    """
    user_id = int(get_jwt_identity())
    
    from app.auth.rbac import has_role
    if not has_role(user_id, ['auditor', 'compliance', 'admin']):
        return jsonify({'error': 'Unauthorized'}), 403
    
    from_date = request.args.get('from_date')
    to_date = request.args.get('to_date')
    format_type = request.args.get('format', 'pdf').lower()
    
    if not from_date:
        from_date = (datetime.utcnow() - timedelta(days=90)).strftime('%Y-%m-%d')
    if not to_date:
        to_date = datetime.utcnow().strftime('%Y-%m-%d')
    
    # Implementation for SAR report
    
    return jsonify({'message': 'Report generation in development'}), 200