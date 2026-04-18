from app import create_app, db
from sqlalchemy import inspect

app = create_app()
with app.app_context():
    inspector = inspect(db.engine)
    columns = [c['name'] for c in inspector.get_columns('users')]
    print(f"Users table columns on 5001: {columns}")
    
    # Also check if 'admin' user can be found if it exists
    from app.models.user import User
    admin = User.query.filter_by(user_role='Admin').first()
    if admin:
        print(f"Found Admin: {admin.email}")
    else:
        print("No Admin user found yet.")
