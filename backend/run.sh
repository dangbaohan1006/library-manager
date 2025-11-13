#!/bin/bash

# Library Manager Backend Runner

echo "🚀 Starting Library Manager Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Run the application
echo "✅ Starting FastAPI server..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000

