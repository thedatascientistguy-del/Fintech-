import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import os

def train_fraud_model():
    """Train XGBoost model for fraud detection"""
    
    # Load dataset
    print("Loading dataset...")
    df = pd.read_csv('data/fraud_dataset.csv')
    
    # Features
    feature_cols = ['amount', 'amount_deviation', 'transaction_count_24h', 
                    'merchant_category_encoded', 'hour_of_day', 'day_of_week', 
                    'is_weekend', 'device_change', 'location_change']
    
    X = df[feature_cols]
    y = df['is_fraud']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost model
    print("\nTraining XGBoost model...")
    model = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=len(y_train[y_train==0]) / len(y_train[y_train==1]),  # Handle imbalance
        random_state=42,
        eval_metric='logloss'
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    print("\nEvaluating model...")
    y_pred = model.predict(X_test_scaled)
    y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    print(f"\nROC-AUC Score: {roc_auc_score(y_test, y_pred_proba):.4f}")
    
    # Feature importance
    print("\nFeature Importance:")
    for feature, importance in zip(feature_cols, model.feature_importances_):
        print(f"{feature}: {importance:.4f}")
    
    # Save model and scaler
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/fraud_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    print("\nModel saved to models/fraud_model.pkl")
    print("Scaler saved to models/scaler.pkl")
    
    return model, scaler

if __name__ == '__main__':
    train_fraud_model()
