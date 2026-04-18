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
    """Convert user identity to string for storage in JWT"""
    if hasattr(user, 'user_id'):
        return str(user.user_id)
    return str(user)

@jwt.user_lookup_loader
def user_lookup_callback(_jwt_header, jwt_data):
    """Load user object from database based on JWT identity"""
    try:
        identity = jwt_data.get("sub")
        if not identity:
            return None
            
        from app.models.user import User
        # Convert identity to integer safely
        user_id = int(str(identity).split('.')[0]) if str(identity).isdigit() or (isinstance(identity, str) and identity.replace('.','',1).isdigit()) else int(identity)
        return User.query.get(user_id)
    except (ValueError, TypeError, AttributeError):
        return None

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
            print("MongoDB indexes created successfully!")
        except Exception as e:
            print(f"MongoDB index creation warning: {e}")
        
        print("MongoDB connected successfully!")
        
    except Exception as e:
        print(f"MongoDB connection error: {e}")
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
    from app.routes.reports import reports_bp
    from app.routes.cards import cards_bp
    from app.routes.loans import loans_bp
    from app.routes.beneficiaries import beneficiaries_bp
    from app.routes.notifications import notifications_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(fraud_bp, url_prefix='/api/fraud')  # Add this line
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')    
    app.register_blueprint(cards_bp, url_prefix='/api/cards')
    app.register_blueprint(loans_bp, url_prefix='/api/loans')
    app.register_blueprint(beneficiaries_bp, url_prefix='/api/beneficiaries')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    
    # Create database tables
    @app.route('/')
    def index():
        return jsonify({
            'name': 'IntelliBank API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': '/api/health'
        }), 200

    with app.app_context():
        try:
            from app.models.notification import Notification
            db.create_all()
            print("PostgreSQL tables created successfully!")
        except Exception as e:
            print(f"PostgreSQL table creation error: {e}")
    
    # Register error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()}), 200

    @app.route('/api/debug/routes', methods=['GET'])
    def list_routes():
        from flask import url_for
        import urllib.parse
        output = []
        for rule in app.url_map.iter_rules():
            methods = ','.join(rule.methods)
            url = str(rule)
            output.append(f"{rule.endpoint:50s} {methods:20s} {url}")
        return jsonify(sorted(output))

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
        print("MongoDB connection closed")

# Register close function to run when app exits
atexit.register(close_mongo_connection)