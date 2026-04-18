# Setup and Installation Guide

Follow these steps to get the Intelligent Banking Platform running on your local machine.

## 📋 Prerequisites
- Python 3.10 or higher
- Node.js 16+ and npm
- PostgreSQL 14+
- MongoDB 5+

## 🔧 Backend Setup
1. **Navigate to backend directory**:
   ```powershell
   cd backend
   ```
2. **Create a virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```
4. **Environment Variables**:
   Create a `.env` file in the `backend/` folder:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/banking_db
   MONGODB_URI=mongodb://localhost:27017/fraud_analytics
   JWT_SECRET_KEY=your_secret_key
   ```
5. **Initialize Database**:
   ```powershell
   flask db upgrade
   ```
6. **Run the server**:
   ```powershell
   python run.py
   ```
   *Note: Backend runs on port **5001** to avoid system conflicts.*

## 🎨 Frontend Setup
1. **Navigate to the frontend directory**:
   ```powershell
   cd frontend/client
   ```
2. **Install packages**:
   ```powershell
   npm install
   ```
3. **Configure API**:
   Ensure `src/services/api.js` points to `http://localhost:5001/api`.
4. **Start Development Server**:
   ```powershell
   npm start
   ```
   *Note: Frontend runs on port **3001**.*

## ✅ Verification
- Access the dashboard at `http://localhost:3001/dashboard`.
- Test registration with a Nigerian email and valid phone number.
- Ensure the Naira symbol (₦) appears in the balance widgets.
