# IntelliBank — Full Deployment Guide
### Frontend → Vercel | Backend → Render | Database → Supabase

---

## Overview

| Service | Platform | URL Pattern |
|--------|----------|-------------|
| Frontend (React/Vite) | Vercel | `https://intellibank.vercel.app` |
| Backend (Flask/Python) | Render | `https://intellibank-backend.onrender.com` |
| PostgreSQL Database | Supabase | Managed cloud Postgres |
| MongoDB Logs | MongoDB Atlas (free) | Managed cloud MongoDB |

---

## Step 1 — Set Up Supabase Database

1. Go to **https://supabase.com** → Sign Up / Log In
2. Click **"New project"** → give it a name e.g. `intellibank-db`
3. Choose a region close to Nigeria (e.g. West Europe or South Africa)
4. Set a strong database password → **save it securely**
5. Wait ~2 mins for project to initialise
6. Go to **Settings → Database**
7. Copy the **Connection string (URI)** — it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
   ```
8. Go to **SQL Editor** and run the contents of:
   ```
   banking-project-backup/database/schema.sql
   ```
   This creates all tables (users, accounts, transactions, fraud_alerts, etc.)

> **Important:** Keep this connection string — you will need it in Step 3.

---

## Step 2 — Deploy Backend to Render

### 2a. Push code to GitHub
1. Open a terminal in `c:\Users\taofa\Desktop\banking-project-backup`
2. Run:
   ```bash
   git init
   git add .
   git commit -m "Initial production deployment"
   ```
3. Go to **https://github.com** → Create a **new repository** named `intellibank`
4. Follow GitHub's instructions to push:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/intellibank.git
   git branch -M main
   git push -u origin main
   ```

### 2b. Create Render Web Service
1. Go to **https://render.com** → Sign Up / Log In
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (`intellibank`)
4. Configure the service:

   | Field | Value |
   |-------|-------|
   | Name | `intellibank-backend` |
   | Root Directory | `backend` |
   | Runtime | `Python 3` |
   | Build Command | `pip install -r requirements.txt` |
   | Start Command | `gunicorn run:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120` |
   | Instance Type | Free (or Starter for better performance) |

5. Under **Environment Variables**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | *Your Supabase connection string from Step 1* |
   | `JWT_SECRET_KEY` | *Generate a random 64-char string* |
   | `SECRET_KEY` | *Generate another random 64-char string* |
   | `FLASK_ENV` | `production` |
   | `CORS_ORIGINS` | `https://intellibank.vercel.app` *(update after Step 3)* |

   > **Tip:** Generate secure keys at https://generatepasswords.org (64 chars, mixed)

6. Click **"Create Web Service"**
7. Wait for deployment to complete (~5 minutes)
8. Copy the URL shown: `https://intellibank-backend.onrender.com`

### 2c. Run Database Migrations on Render
After the first successful deploy:
1. Go to your Render service → **Shell** tab
2. Run:
   ```bash
   python -c "from app import create_app, db; app = create_app(); app.app_context().__enter__(); db.create_all()"
   ```

---

## Step 3 — Deploy Frontend to Vercel

### 3a. Install Vercel CLI (one time)
```bash
npm install -g vercel
```

### 3b. Deploy
1. Open terminal, navigate to the frontend folder:
   ```bash
   cd c:\Users\taofa\Desktop\banking-project-backup\frontend\client
   ```
2. Run:
   ```bash
   vercel
   ```
3. Follow prompts:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Your account
   - **Link to existing project?** → No
   - **Project name?** → `intellibank`
   - **Directory?** → `./` (current directory)
   - **Override settings?** → No

4. After first deployment, set the environment variable:
   ```bash
   vercel env add VITE_API_URL
   ```
   When prompted, enter your Render backend URL:
   ```
   https://intellibank-backend.onrender.com
   ```
   Select **Production** environment.

5. Redeploy to apply the env var:
   ```bash
   vercel --prod
   ```

6. Your app is now live at `https://intellibank.vercel.app` ✅

---

## Step 4 — Update CORS on Render

After you get your Vercel URL, update the `CORS_ORIGINS` environment variable on Render:

1. Go to Render → Your Service → **Environment**
2. Update `CORS_ORIGINS` to your actual Vercel URL:
   ```
   https://intellibank.vercel.app,https://intellibank-XXXX-your-username.vercel.app
   ```
3. Render will auto-redeploy with the new setting

---

## Step 5 — Optional: MongoDB Atlas for Logs

1. Go to **https://cloud.mongodb.com** → Sign Up
2. Create a **Free M0 cluster** → choose any region
3. Create a database user and allow connections from anywhere (`0.0.0.0/0`)
4. Get the connection string:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/banking_logs
   ```
5. Add to Render env vars:
   - `MONGO_URI` = *your Atlas connection string*
   - `MONGO_DB` = `banking_logs`

---

## Step 6 — Verify Everything Works

After deployment, test these endpoints from a browser or Postman:

```
GET  https://intellibank-backend.onrender.com/api/health
POST https://intellibank-backend.onrender.com/api/auth/login
GET  https://intellibank.vercel.app  (should load the login page)
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend returns 502/503 | Check Render logs — likely a startup crash. Verify env vars are set correctly. |
| "CORS error" in browser | Update `CORS_ORIGINS` on Render to include your exact Vercel URL. |
| Database connection fails | Check Supabase URL format has `postgresql://` not `postgres://`. The app auto-fixes this. |
| Frontend shows blank page | Check browser console. If `/api` calls fail, confirm `VITE_API_URL` is set on Vercel. |
| PDF download fails | Ensure the user has at least one account with transactions. The PDF is generated client-side. |
| Render free tier sleeps | Free Render services sleep after 15 min of inactivity. First request after sleep takes ~30s. Upgrade to Starter ($7/mo) to avoid this. |

---

## Environment Variables Summary

### Backend (Render)
| Variable | Where to Get |
|----------|--------------|
| `DATABASE_URL` | Supabase → Settings → Database → URI |
| `JWT_SECRET_KEY` | Generate randomly |
| `SECRET_KEY` | Generate randomly |
| `CORS_ORIGINS` | Your Vercel frontend URL |
| `MONGO_URI` | MongoDB Atlas connection string |
| `MONGO_DB` | `banking_logs` |
| `FLASK_ENV` | `production` |

### Frontend (Vercel)
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Render backend URL (no trailing slash) |

---

## Local Development (Docker Compose)

To continue running locally:
```bash
cd c:\Users\taofa\Desktop\banking-project-backup
docker-compose up --build
```

Access locally at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- API Health: http://localhost:5001/api/health
