# Deployment Guide

## 🐳 Docker Deployment (Recommended)
The project includes a `docker-compose.yml` for unified deployment.

1. **Build and Start**:
   ```powershell
   docker-compose up --build -d
   ```
2. **Ports**:
   - Frontend: `http://localhost:3001`
   - Backend: `http://localhost:5001`

## ☁️ Manual Cloud Deployment (AWS/Azure/GCP)
1. **Database**: Use a managed service like AWS RDS (Postgres) and MongoDB Atlas.
2. **Backend**:
   - Use Gunicorn or Waitress for the Flask server.
   - Set `FLASK_ENV=production`.
   - Use a reverse proxy like Nginx for SSL termination.
3. **Frontend**:
   - Build the production bundle: `npm run build`.
   - Serve the static files from the `build/` folder using Nginx or S3/CloudFront.

## 🛡️ Security Best Practices
- Change all `SECRET_KEY` and passwords in `.env` before deploying.
- Ensure `CORS_ALLOWED_ORIGINS` in `backend/config.py` is restricted to your production domain.
- Use HTTPS for all communications.
- Enable OS-level firewalls for ports 5432 and 27017.
