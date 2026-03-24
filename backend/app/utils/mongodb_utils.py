from pymongo import MongoClient, errors
from datetime import datetime
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDBClient:
    _instance = None
    _client = None
    _db = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize MongoDB connection"""
        try:
            self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
            self.db_name = os.getenv('MONGO_DB', 'banking_logs')
            
            self._client = MongoClient(
                self.mongo_uri,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000
            )
            
            # Test connection
            self._client.admin.command('ping')
            self._db = self._client[self.db_name]
            
            # Ensure indexes exist
            self._ensure_indexes()
            
            logger.info(f"✅ Connected to MongoDB: {self.db_name}")
            
        except errors.ConnectionError as e:
            logger.error(f"❌ MongoDB connection error: {e}")
            raise
        except Exception as e:
            logger.error(f"❌ Unexpected error: {e}")
            raise
    
    def _ensure_indexes(self):
        """Create necessary indexes for performance"""
        try:
            # Audit logs indexes
            self._db.audit_logs.create_index("timestamp", expireAfterSeconds=7776000)  # 90 days TTL
            self._db.audit_logs.create_index("user_id")
            self._db.audit_logs.create_index([("timestamp", -1)])
            
            # Fraud alerts indexes
            self._db.fraud_alerts.create_index("created_at")
            self._db.fraud_alerts.create_index("status")
            self._db.fraud_alerts.create_index("confidence_score")
            self._db.fraud_alerts.create_index([("created_at", -1)])
            
            # User sessions indexes
            self._db.user_sessions.create_index("user_id")
            self._db.user_sessions.create_index("login_time")
            self._db.user_sessions.create_index("session_token", unique=True)
            
            logger.info("✅ Indexes created/verified")
            
        except Exception as e:
            logger.warning(f"⚠️ Index creation warning: {e}")
    
    @property
    def db(self):
        return self._db
    
    def close(self):
        """Close MongoDB connection"""
        if self._client:
            self._client.close()
            logger.info("🔌 MongoDB connection closed")
    
    # Logging methods
    def log_audit(self, user_id, action, ip_address=None, user_agent=None, details=None):
        """Insert audit log"""
        log_entry = {
            "user_id": user_id,
            "action": action,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details or {},
            "timestamp": datetime.utcnow()
        }
        return self._db.audit_logs.insert_one(log_entry)
    
    def log_fraud_alert(self, transaction_id, user_id, alert_type, severity, confidence, description):
        """Insert fraud alert"""
        alert = {
            "transaction_id": transaction_id,
            "user_id": user_id,
            "alert_type": alert_type,
            "severity": severity,
            "confidence_score": confidence,
            "description": description,
            "status": "pending",
            "created_at": datetime.utcnow()
        }
        return self._db.fraud_alerts.insert_one(alert)
    
    def log_api_call(self, endpoint, method, user_id, response_time, status_code, request_data=None):
        """Log API call"""
        log_entry = {
            "endpoint": endpoint,
            "method": method,
            "user_id": user_id,
            "response_time_ms": response_time,
            "status_code": status_code,
            "request_data": request_data,
            "timestamp": datetime.utcnow()
        }
        return self._db.api_logs.insert_one(log_entry)
    
    def create_user_session(self, user_id, session_token, ip_address, user_agent):
        """Create user session log"""
        session = {
            "user_id": user_id,
            "session_token": session_token,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "login_time": datetime.utcnow(),
            "is_active": True
        }
        return self._db.user_sessions.insert_one(session)
    
    def end_user_session(self, session_token):
        """End user session"""
        return self._db.user_sessions.update_one(
            {"session_token": session_token},
            {"$set": {"logout_time": datetime.utcnow(), "is_active": False}}
        )

# Create singleton instance
mongodb_client = MongoDBClient()

# Convenience functions
def get_mongodb():
    """Get MongoDB client instance"""
    return mongodb_client

def close_mongodb():
    """Close MongoDB connection"""
    mongodb_client.close()