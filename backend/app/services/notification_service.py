import logging
from datetime import datetime
from flask import current_app

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_notification(user, title, message, notification_type='General', metadata=None):
        """
        Send a notification to the user via platform, email, and SMS.
        """
        # 1. Platform Notification (Database)
        try:
            from app.models.notification import Notification
            from app import db
            
            notification = Notification(
                user_id=user.user_id,
                title=title,
                message=message,
                notification_type=notification_type,
                extra_data=metadata,
                created_at=datetime.utcnow()
            )
            db.session.add(notification)
            db.session.commit()
            logger.info(f"Platform notification saved to DB for User {user.user_id}")
        except Exception as e:
            logger.error(f"Failed to save platform notification: {str(e)}")
            db.session.rollback()

        # 2. Real-Time Alert Routing
        email_to = user.alert_email if user.alert_email else user.email
        sms_to = user.alert_phone if user.alert_phone else user.phone_number
        
        # Use user-specific credentials if provided
        app_password = user.gmail_app_password if user.gmail_app_password else "PLATFORM_DEFAULT"
        
        logger.info(f"Routing alert for User {user.user_id} using credential: {app_password[:4]}****")
        
        NotificationService._send_email_realtime(email_to, title, message, app_password)
        NotificationService._send_sms_realtime(sms_to, message)

    @staticmethod
    def _send_email_realtime(email, title, message, app_password):
        """
        Email implementation. 
        If app_password is set, this would use smtplib.SMTP_SSL() with gmail.
        """
        logger.info(f"--- REAL-TIME EMAIL ---")
        logger.info(f"To: {email}")
        logger.info(f"Auth: Gmail App ({app_password[:4]}****)")
        logger.info(f"Subject: {title}")
        logger.info(f"-----------------------")

    @staticmethod
    def _send_sms_realtime(phone, message):
        """
        SMS implementation. 
        Uses the country-encoded phone number.
        """
        logger.info(f"--- REAL-TIME SMS ---")
        logger.info(f"To: {phone}")
        logger.info(f"Message: {message}")
        logger.info(f"----------------------")

    @staticmethod
    def send_fraud_alert(user, transaction):
        """
        Specific alert for fraud detection.
        """
        title = "⚠️ SECURITY ALERT: Suspicious Activity"
        message = (f"A transaction of NGN {transaction.amount:,.2f} on your account (...{str(transaction.from_account_id)[-4:]}) "
                   f"has been flagged. Please log in to approve/block immediately.")
        
        metadata = {'transaction_id': transaction.transaction_id}
        NotificationService.send_notification(user, title, message, notification_type='Security', metadata=metadata)

    @staticmethod
    def _send_email_stub(email, title, message):
        """
        Email integration stub. 
        In production, use SendGrid, Mailgun, or Flask-Mail.
        """
        logger.info(f"--- EMAIL STUB ---")
        logger.info(f"To: {email}")
        logger.info(f"Subject: {title}")
        logger.info(f"Body: {message}")
        logger.info(f"------------------")

    @staticmethod
    def _send_sms_stub(phone, message):
        """
        SMS integration stub.
        In production, use Twilio, Nexmo, or AWS SNS.
        """
        logger.info(f"--- SMS STUB ---")
        logger.info(f"To: {phone}")
        logger.info(f"Message: {message}")
        logger.info(f"-----------------")
