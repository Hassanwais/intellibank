import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database — handle Supabase/Render postgres:// → postgresql://
    _db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:Admin%40123@localhost:5433/banking_db')
    if _db_url.startswith('postgres://'):
        _db_url = _db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,
        'pool_recycle': 300,
    }
    
    # MongoDB
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    MONGO_DB = os.getenv('MONGO_DB', 'banking_logs')
    
    # JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Security
    BCRYPT_LOG_ROUNDS = 13
    SECRET_KEY = os.getenv('SECRET_KEY', 'another-secret-key')
    
    # AI Model
    MODEL_PATH = os.getenv('MODEL_PATH', 'app/ai/models/fraud_detection_model.pkl')
    
    # CORS — allow localhost and any Vercel deployment
    CORS_ORIGINS = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:3000,http://localhost:3001,https://*.vercel.app'
    ).split(',')
    
    # Environment
    DEBUG = os.getenv('FLASK_DEBUG', 'False') == 'True'
    TESTING = False
    
    # Email
    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'true').lower() == 'true'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')