from werkzeug.security import generate_password_hash
from app import db, create_app
from app.models.user import User

def reset():
    app = create_app()
    with app.app_context():
        user = User.query.filter_by(email='taofeekabolade@yahoo.com').first()
        if user:
            user.password_hash = generate_password_hash('Admin@123')
            db.session.commit()
            print("Password reset successful for taofeekabolade@yahoo.com")
        else:
            print("User not found")

if __name__ == "__main__":
    reset()
