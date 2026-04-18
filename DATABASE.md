# Database Documentation

The platform uses a hybrid database strategy to ensure both data integrity and analytical speed.

## 🐘 PostgreSQL (Core Banking)
Used for user accounts, transactions, and balances.

### 🗺️ Key Tables
- **users**: Authentication, roles (`Admin`/`Customer`), and verified status.
- **accounts**: Bank account details, account types (`Savings`, `Checking`, `Business`), and current `NGN` balance.
- **transactions**: Every financial move including audit trail and AI fraud flags.

### 🛠️ Common Operations
- **Migrations**: `flask db migrate -m "description"` followed by `flask db upgrade`.
- **Backup**: `pg_dump banking_db > backup.sql`.

## 🍃 MongoDB (Fraud Analytics)
Used by the AI pipeline to store behavioral data and detailed fraud scoring logs.

### 📦 Collections
- **fraud_alerts**: Raw data from flagged transactions.
- **system_logs**: Security-relevant events (failed logins, geo-sharding).

## 📍 Local Connection Details
- **Postgres**: Defaults to `localhost:5432`.
- **MongoDB**: Defaults to `localhost:27017`.

> [!IMPORTANT]
> Always ensure the `user_role` column exists in the `users` table before starting the application, as it is critical for permission routing.
