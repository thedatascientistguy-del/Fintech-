#!/bin/bash

echo "🚀 Setting up FinTech Fraud Detection SaaS..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"

# Create directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p ml-model/models
mkdir -p ml-model/data

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your credentials"
fi

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

cd services/transaction-api && npm install && cd ../..
cd services/fraud-detection && npm install && cd ../..
cd services/verification-service && npm install && cd ../..
cd services/ai-voice-agent && npm install && cd ../..
cd services/admin-dashboard && npm install && cd ../..

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd ml-model
pip3 install -r requirements.txt
cd ..

# Generate dataset
echo "📊 Generating fraud detection dataset..."
cd ml-model
python3 generate_dataset.py
cd ..

# Train model
echo "🤖 Training fraud detection model..."
cd ml-model
python3 train_model.py
cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your credentials"
echo "2. Start services: docker-compose up -d"
echo "3. Access admin dashboard: http://localhost:3004"
echo ""
echo "For manual service start:"
echo "  npm run dev"
