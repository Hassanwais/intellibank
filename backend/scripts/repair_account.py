import os
import sys

# Add app to path
sys.path.append(os.getcwd())

def repair_user(email, new_password):
    from app import create_app, db, bcrypt
    from app.models.user import User
    
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if not user:
            print(f"Error: User {email} not found.")
            return
            
        print(f"Repairing user: {user.email}")
        print(f"Previous hash: {user.password_hash[:15]}...")
        
        # Force a new Bcrypt hash using the internal bcrypt instance
        new_hash = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password_hash = new_hash
        user.account_status = 'Active' # Ensure they aren't locked out
        
        db.session.commit()
        print(f"Password reset to '{new_password}' successfully.")
        print(f"New hash prefix: {new_hash[:4]}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python repair_account.py <email> <password>")
        # Defaulting for this specific task
        repair_user('taofeekabolade@yahoo.com', 'Admin@123')
    else:
        repair_user(sys.argv[1], sys.argv[2])
