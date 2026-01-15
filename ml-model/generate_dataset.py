import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

np.random.seed(42)
random.seed(42)

def generate_fraud_dataset(n_samples=50000):
    """Generate synthetic fraud detection dataset with Pakistani Rupees"""
    
    data = []
    
    # Merchant categories
    categories = ['grocery', 'restaurant', 'fuel', 'shopping', 'utilities', 
                  'healthcare', 'entertainment', 'travel', 'gambling', 'crypto', 
                  'international', 'atm_withdrawal']
    
    for i in range(n_samples):
        # 5% fraud rate
        is_fraud = 1 if random.random() < 0.05 else 0
        
        if is_fraud:
            # Fraudulent transactions characteristics
            amount = np.random.choice([
                np.random.uniform(50000, 500000),  # High amounts
                np.random.uniform(1000, 10000)     # Multiple small amounts
            ])
            hour = np.random.choice([0, 1, 2, 3, 4, 23])  # Late night
            merchant_category = np.random.choice(['gambling', 'crypto', 'international', 'atm_withdrawal'])
            transaction_count_24h = np.random.randint(5, 20)  # High frequency
            device_change = 1
            location_change = 1
            amount_deviation = np.random.uniform(2, 10)  # High deviation
        else:
            # Normal transactions
            amount = np.random.lognormal(9, 1.5)  # Log-normal distribution for amounts
            amount = min(amount, 100000)  # Cap at 100k PKR
            hour = np.random.randint(8, 22)  # Normal hours
            merchant_category = np.random.choice(['grocery', 'restaurant', 'fuel', 'shopping', 
                                                  'utilities', 'healthcare', 'entertainment'])
            transaction_count_24h = np.random.randint(0, 5)
            device_change = 1 if random.random() < 0.1 else 0
            location_change = 1 if random.random() < 0.15 else 0
            amount_deviation = np.random.uniform(0, 2)
        
        day_of_week = np.random.randint(0, 7)
        is_weekend = 1 if day_of_week in [0, 6] else 0
        
        data.append({
            'amount': round(amount, 2),
            'amount_deviation': round(amount_deviation, 2),
            'transaction_count_24h': transaction_count_24h,
            'merchant_category': merchant_category,
            'hour_of_day': hour,
            'day_of_week': day_of_week,
            'is_weekend': is_weekend,
            'device_change': device_change,
            'location_change': location_change,
            'is_fraud': is_fraud
        })
    
    df = pd.DataFrame(data)
    
    # Encode categorical variables
    df['merchant_category_encoded'] = pd.Categorical(df['merchant_category']).codes
    
    print(f"Dataset generated: {len(df)} samples")
    print(f"Fraud cases: {df['is_fraud'].sum()} ({df['is_fraud'].mean()*100:.2f}%)")
    print(f"\nAmount statistics (PKR):")
    print(df.groupby('is_fraud')['amount'].describe())
    
    return df

if __name__ == '__main__':
    df = generate_fraud_dataset(50000)
    df.to_csv('data/fraud_dataset.csv', index=False)
    print("\nDataset saved to data/fraud_dataset.csv")
