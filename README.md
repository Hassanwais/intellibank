# Intelligent Online Banking Platform (Nigeria)

A premium, AI-powered banking solution localized for the Nigerian market. This platform features real-time fraud detection, multi-account management, and a high-performance React dashboard.

## 🚀 Key Features
- **Localized Experience**: Full support for Nigerian Naira (₦), local currency formatting (`en-NG`), and localized banking terms.
- **AI-Shield Security**: Real-time fraud detection pipeline integrated with the transfer flow to flag suspicious behavior.
- **Unified Dashboard**: Clean, responsive UI with interactive financial charts and quick-action widgets.
- **Secure Authentication**: JWT-based auth with support for MFA and secure session management.
- **Relational & Analytics Data**: Powered by PostgreSQL for core banking and MongoDB for fraud analytics.

## 🛠️ Tech Stack
- **Frontend**: React 18, Material UI, Redux Toolkit, Chart.js, Framer Motion.
- **Backend**: Flask (Python 3.10+), SQLAlchemy, JWT-Extended.
- **AI/ML**: Scikit-learn (Fraud Detection Pipeline).
- **Database**: PostgreSQL (Core), MongoDB (Analytics).

## 📊 System Architecture
The system follows a micro-service architecture pattern:
1. **Client (3001)**: React single-page application.
2. **API Server (5001)**: Secure Flask REST API.
3. **Database Layer**: Dual-database strategy for ACID compliance and high-performance analytics.

## 📜 Documentation
Full documentation is available in the following files:
- [SETUP.md](file:///c:/Users/taofa/Desktop/banking-project-backup/SETUP.md): Detailed installation and environment setup.
- [DATABASE.md](file:///c:/Users/taofa/Desktop/banking-project-backup/DATABASE.md): Schema design and database management.
- [DEPLOYMENT.md](file:///c:/Users/taofa/Desktop/banking-project-backup/DEPLOYMENT.md): Guide for production deployment.

---
Created for the Intelligent Online Banking Platform Project - 2026
