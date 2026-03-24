from app.ai.fraud_detection_model import get_fraud_model
from datetime import datetime
import os
import sys

class RealTimeFraudDetector:
    def __init__(self):
        self.model = get_fraud_model()
        self.alert_threshold = 0.6  # Alert on transactions with >60% fraud probability
    
    def analyze_transaction(self, transaction_data):
        """
        Analyze a transaction for fraud
        transaction_data should contain:
            - amount: float
            - timestamp: datetime
            - transaction_type: str
            - account_age_days: int
            - avg_transaction_amount_30d: float
            - transaction_count_24h: int
            - distance_from_home: float (km)
            - is_international: bool
        """
        # Extract features from transaction
        features = self._extract_features(transaction_data)
        
        # Get prediction
        result = self.model.predict(features)
        
        # Add analysis metadata
        result['transaction_id'] = transaction_data.get('transaction_id')
        result['analyzed_at'] = datetime.utcnow().isoformat()
        result['requires_review'] = result['probability'] > self.alert_threshold
        
        return result
    
    def _extract_features(self, data):
        """Extract and format features for the model"""
        features = {}
        
        # Amount
        features['amount'] = float(data.get('amount', 0))
        
        # Time features
        timestamp = data.get('timestamp', datetime.utcnow())
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp)
        features['hour_of_day'] = timestamp.hour
        features['day_of_week'] = timestamp.weekday()
        
        # Transaction type mapping
        tx_type_map = {'Transfer': 0, 'Payment': 1, 'Withdrawal': 2, 'Deposit': 3}
        features['transaction_type_encoded'] = tx_type_map.get(
            data.get('transaction_type', 'Transfer'), 0
        )
        
        # Other features
        features['is_international'] = int(data.get('is_international', False))
        features['account_age_days'] = int(data.get('account_age_days', 365))
        features['avg_transaction_amount_30d'] = float(data.get('avg_transaction_amount_30d', 100))
        features['transaction_count_24h'] = int(data.get('transaction_count_24h', 0))
        features['distance_from_home'] = float(data.get('distance_from_home', 0))
        
        return features
    
    def get_risk_color(self, risk_level):
        """Return color code for risk level"""
        colors = {
            'Low': '#28a745',     # Green
            'Medium': '#ffc107',   # Yellow
            'High': '#fd7e14',     # Orange
            'Critical': '#dc3545'  # Red
        }
        return colors.get(risk_level, '#6c757d')

# Singleton instance
_detector = None

def get_detector():
    global _detector
    if _detector is None:
        _detector = RealTimeFraudDetector()
    return _detector