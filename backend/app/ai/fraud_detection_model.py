import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os
import random

class FraudDetectionModel:
    def __init__(self, model_path=None):
        # Set up paths using absolute paths
        if model_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.model_path = os.path.join(base_dir, 'models', 'fraud_model.pkl')
        else:
            self.model_path = model_path
            
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.feature_names = [
            'amount', 'hour_of_day', 'day_of_week', 
            'transaction_type_encoded', 'is_international',
            'account_age_days', 'avg_transaction_amount_30d',
            'transaction_count_24h', 'distance_from_home'
        ]
        
    def generate_training_data(self, n_samples=10000):
        """Generate synthetic transaction data for training"""
        print(f"Generating {n_samples} synthetic transactions for training...")
        
        data = []
        
        for i in range(n_samples):
            # Normal transaction (90% of data)
            is_fraud = 1 if random.random() < 0.1 else 0  # 10% fraud rate
            
            # Generate features
            amount = random.uniform(10, 50000)
            if is_fraud:
                # Fraudulent transactions tend to be even larger or more irregular
                amount = random.uniform(1000, 100000)
            
            hour = random.randint(0, 23)
            day = random.randint(0, 6)
            
            # Transaction types: 0=Transfer, 1=Payment, 2=Withdrawal, 3=Deposit
            tx_type = random.randint(0, 3)
            if is_fraud and random.random() > 0.7:
                tx_type = 0  # Fraud often involves transfers
            
            is_international = 1 if random.random() < 0.1 else 0
            if is_fraud:
                is_international = 1 if random.random() < 0.4 else 0
            
            account_age = random.randint(1, 3650)  # 1 day to 10 years
            if is_fraud and random.random() > 0.6:
                account_age = random.randint(1, 30)  # New accounts more risky
            
            avg_amount = random.uniform(50, 1000)
            tx_count_24h = random.randint(0, 20)
            if is_fraud and random.random() > 0.5:
                tx_count_24h = random.randint(5, 30)  # Unusual activity
            
            distance = random.uniform(0, 5000)  # km from home
            if is_fraud:
                distance = random.uniform(100, 10000)
            
            data.append([
                amount, hour, day, tx_type, is_international,
                account_age, avg_amount, tx_count_24h, distance, is_fraud
            ])
        
        columns = self.feature_names + ['is_fraud']
        df = pd.DataFrame(data, columns=columns)
        
        # Create data directory if it doesn't exist
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        data_dir = os.path.join(base_dir, 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        # Save with absolute path
        file_path = os.path.join(data_dir, 'training_data.csv')
        df.to_csv(file_path, index=False)
        print(f"✅ Training data saved to {file_path}")
        
        return df
    
    def train(self, df=None):
        """Train the fraud detection model"""
        if df is None:
            # Try to load existing data or generate new
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, 'data', 'training_data.csv')
            
            if os.path.exists(data_path):
                df = pd.read_csv(data_path)
                print("Loaded existing training data")
            else:
                df = self.generate_training_data()
        
        # Prepare features and target
        X = df[self.feature_names]
        y = df['is_fraud']
        
        # Encode categorical features
        for col in ['transaction_type_encoded']:
            if col in X.columns:
                le = LabelEncoder()
                X[col] = le.fit_transform(X[col].astype(str))
                self.label_encoders[col] = le
        
        # Scale numerical features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        print("Training Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            class_weight='balanced'
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred)
        recall = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        
        print("\n✅ Model Training Complete!")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1 Score: {f1:.4f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nTop 5 Important Features:")
        print(feature_importance.head(5))
        
        # Save model
        self.save_model()
        
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'feature_importance': feature_importance.to_dict('records')
        }
    
    def predict(self, transaction_data):
        """Predict fraud probability for a single transaction"""
        if self.model is None:
            self.load_model()
        
        # Prepare features
        features = []
        for feature in self.feature_names:
            if feature in transaction_data:
                features.append(transaction_data[feature])
            else:
                features.append(0)
        
        # Reshape and scale
        features = np.array(features).reshape(1, -1)
        features_scaled = self.scaler.transform(features)
        
        # Predict
        probability = self.model.predict_proba(features_scaled)[0][1]
        prediction = 1 if probability > 0.5 else 0
        
        return {
            'is_fraud': bool(prediction),
            'probability': float(probability),
            'risk_level': self.get_risk_level(probability)
        }
    
    def get_risk_level(self, probability):
        """Convert probability to risk level"""
        if probability < 0.3:
            return 'Low'
        elif probability < 0.6:
            return 'Medium'
        elif probability < 0.8:
            return 'High'
        else:
            return 'Critical'
    
    def save_model(self):
        """Save model to disk"""
        # Create models directory if it doesn't exist
        model_dir = os.path.dirname(self.model_path)
        os.makedirs(model_dir, exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_names': self.feature_names
        }
        joblib.dump(model_data, self.model_path)
        print(f"✅ Model saved to {self.model_path}")
    
    def load_model(self):
        """Load model from disk"""
        if os.path.exists(self.model_path):
            model_data = joblib.load(self.model_path)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoders = model_data['label_encoders']
            print(f"Model loaded from {self.model_path}")
            return True
        else:
            print(f"❌ Model not found at {self.model_path}")
            return False

# Singleton instance
_fraud_model = None

def get_fraud_model():
    global _fraud_model
    if _fraud_model is None:
        _fraud_model = FraudDetectionModel()
        if not _fraud_model.load_model():
            print("No existing model found. Training new model...")
            _fraud_model.train()
    return _fraud_model