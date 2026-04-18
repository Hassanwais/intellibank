from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.notification import Notification
from app import db
import logging

logger = logging.getLogger(__name__)

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@jwt_required()
def get_notifications():
    try:
        user_id = int(get_jwt_identity())
        notifications = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(50).all()
        return jsonify({'notifications': [n.to_dict() for n in notifications]}), 200
    except Exception as e:
        logger.error(f"Error fetching notifications: {str(e)}")
        return jsonify({'error': str(e)}), 500

@notifications_bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(id):
    try:
        user_id = int(get_jwt_identity())
        notification = Notification.query.filter_by(notification_id=id, user_id=user_id).first()
        if not notification:
            return jsonify({'error': 'Notification not found'}), 404
            
        notification.is_read = True
        db.session.commit()
        return jsonify({'message': 'Marked as read'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
