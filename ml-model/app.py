from flask import Flask, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load model and scaler
MODEL_PATH = 'models/fraud_model.pkl'
SCALER_PATH = 'models/scaler.pkl'

model = None
scaler = None

def load_model():
    global model, scaler
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print("Model and scaler loaded successfully")
    else:
        print("Warning: Model files not found. Please train the model first.")

load_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'ml-fraud-detection',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None or scaler is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        data = request.json
        features = data.get('features', {})
        
        # Extract features in correct order
        feature_vector = np.array([[
            features.get('amount', 0),
            features.get('amount_deviation', 0),
            features.get('transaction_count_24h', 0),
            features.get('merchant_category', 0),  # Should be encoded
            features.get('hour_of_day', 12),
            features.get('day_of_week', 0),
            features.get('is_weekend', 0),
            features.get('device_change', 0),
            features.get('location_change', 0)
        ]])
        
        # Scale features
        feature_vector_scaled = scaler.transform(feature_vector)
        
        # Predict
        fraud_probability = model.predict_proba(feature_vector_scaled)[0][1]
        is_fraud = int(fraud_probability > 0.75)
        
        return jsonify({
            'fraud_probability': float(fraud_probability),
            'is_fraud': is_fraud,
            'confidence': float(max(model.predict_proba(feature_vector_scaled)[0]))
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/retrain', methods=['POST'])
def retrain():
    """Endpoint for retraining model with new data"""
    try:
        # TODO: Implement incremental learning
        return jsonify({'message': 'Retraining not yet implemented'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
