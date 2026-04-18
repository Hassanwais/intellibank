import os
import sys
from datetime import datetime

# Add app to path
sys.path.append(os.getcwd())

def test_login_logic(email, password):
    from app import db, create_app, bcrypt
    from app.models.user import User
    from werkzeug.security import check_password_hash
    
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"User {email} not found.")
            return

        print(f"User found: {user.email}")
        print(f"Hash starts with: {user.password_hash[:15]}...")
        
        is_valid = False
        start_time = datetime.now()
        try:
            if user.password_hash.startswith(('scrypt:', 'pbkdf2:')):
                print("Testing with Werkzeug check_password_hash...")
                is_valid = check_password_hash(user.password_hash, password)
            else:
                print("Testing with Bcrypt check_password_hash...")
                is_valid = bcrypt.check_password_hash(user.password_hash, password)
        except Exception as e:
            print(f"Verification ERROR: {str(e)}")
        
        duration = datetime.now() - start_time
        print(f"Result: {is_valid}")
        print(f"Time taken: {duration.total_seconds()}s")

if __name__ == "__main__":
    # Test with the problematic user
    # I'll try common passwords if known, or just check the hash logic integrity
    test_login_logic('taofeekabolade@yahoo.com', 'Admin@123')
