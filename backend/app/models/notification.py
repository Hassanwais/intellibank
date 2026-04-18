from app import db
from datetime import datetime

class Notification(db.Model):
    __tablename__ = 'notifications'
    
    notification_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    message = db.Column(db.Text, nullable=False)
    notification_type = db.Column(db.String(50), default='General') # Security, Success, etc.
    is_read = db.Column(db.Boolean, default=False)
    extra_data = db.Column(db.JSON, nullable=True) # For transaction_id, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'notification_id': self.notification_id,
            'id': self.notification_id, # Keep 'id' for frontend compatibility
            'title': self.title,
            'message': self.message,
            'type': self.notification_type,
            'time': self.created_at.isoformat(),
            'is_read': self.is_read,
            'metadata': self.extra_data
        }
