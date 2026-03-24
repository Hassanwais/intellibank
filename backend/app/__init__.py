from datetime import datetime
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_mail import Mail
from pymongo import MongoClient
from config import Config
import logging
import os
import atexit

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
jwt = JWTManager()
mail = Mail()
mongo_client = None

# JWT identity functions - FIX for "Subject must be a string" error
@jwt.user_identity_loader
def user_identity_lookup(user):
    """Convert user_id to string when storing in JWT"""
    return str(user)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Convert string user_id back to int when loading from JWT"""
    identity = jwt_data["sub"]
    from app.models.user import User
    return User.query.filter_by(user_id=int(identity)).one_or_none()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    CORS(app, origins=app.config.get('CORS_ORIGINS', '*'))
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    
    # Initialize MongoDB
    global mongo_client
    try:
        mongo_client = MongoClient(
            app.config['MONGO_URI'],
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=5000
        )
        # Test connection
        mongo_client.admin.command('ping')
        app.mongo_db = mongo_client[app.config['MONGO_DB']]
        
        # Create indexes for better performance
        try:
            app.mongo_db.audit_logs.create_index("timestamp", expireAfterSeconds=7776000)
            app.mongo_db.audit_logs.create_index("user_id")
            app.mongo_db.fraud_alerts.create_index("created_at")
            app.mongo_db.fraud_alerts.create_index("status")
            print("✅ MongoDB indexes created successfully!")
        except Exception as e:
            print(f"⚠️ MongoDB index creation warning: {e}")
        
        print("✅ MongoDB connected successfully!")
        
    except Exception as e:
        print(f"⚠️ MongoDB connection error: {e}")
        print("Continuing without MongoDB...")
        mongo_client = None
        app.mongo_db = None
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Register blueprints (routes)
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.accounts import accounts_bp
    from app.routes.transactions import transactions_bp
    from app.routes.fraud import fraud_bp  # Add this line
    from app.routes.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(fraud_bp, url_prefix='/api/fraud')  # Add this line
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Create database tables
    with app.app_context():
        try:
            db.create_all()
            print("✅ PostgreSQL tables created successfully!")
        except Exception as e:
            print(f"⚠️ PostgreSQL table creation error: {e}")
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        # Check MongoDB connection properly
        mongo_status = 'connected'
        try:
            # Try to ping MongoDB to verify connection
            if mongo_client:
                mongo_client.admin.command('ping')
            else:
                mongo_status = 'disconnected'
        except Exception as e:
            mongo_status = f'error: {str(e)}'
            
        status = {
            'status': 'healthy',
            'postgres': 'connected',
            'mongodb': mongo_status
        }
        return jsonify(status), 200

    # Test MongoDB endpoint
    @app.route('/api/test-mongo', methods=['GET'])
    def test_mongo():
        try:
            if mongo_client:
                # Try to insert a test document
                test_doc = {"test": True, "timestamp": datetime.utcnow().isoformat()}
                result = app.mongo_db.system_events.insert_one(test_doc)
                return jsonify({
                    "status": "success",
                    "message": f"Test document inserted with id: {str(result.inserted_id)}"
                }), 200
            else:
                return jsonify({"status": "error", "message": "MongoDB not connected"}), 500
        except Exception as e:
            return jsonify({"status": "error", "message": str(e)}), 500
    
    # IMPORTANT: Return the app object
    return app

# Function to close MongoDB connection when app stops
def close_mongo_connection():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("🔌 MongoDB connection closed")

# Register close function to run when app exits
atexit.register(close_mongo_connection)