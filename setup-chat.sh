#!/bin/bash

echo "🚀 HOWPARTH Chat Setup Script"
echo "=============================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from env.example"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🔧 Configuration Steps:"
echo "1. Edit the .env file and add your OpenAI API key:"
echo "   OPENAI_API_KEY=sk-your-actual-api-key-here"
echo ""
echo "2. Add your fine-tuned model ID:"
echo "   FINE_TUNED_MODEL_ID=ft:gpt-3.5-turbo-0125:personal::CAmRK7vU"
echo ""
echo "3. Start the chat server:"
echo "   node simple-chat-server.js"
echo ""
echo "4. Your React app should already be running on http://localhost:3001"
echo "   Chat server will run on http://localhost:3002"
echo ""
echo "5. Test the setup:"
echo "   curl http://localhost:3002/health"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎯 Quick Test Commands:"
echo "======================="
echo ""
echo "# Test health endpoint:"
echo "curl http://localhost:3002/health"
echo ""
echo "# Test chat endpoint:"
echo 'curl -X POST http://localhost:3002/api/chat -H "Content-Type: application/json" -d '"'"'{"message":"Hello!","userId":"test"}'"'"''
echo ""
echo "📱 Your chat should now work at:"
echo "   http://localhost:3001/chat"
echo ""
echo "🔍 If you see issues, check:"
echo "   1. React app is running on port 3001"
echo "   2. Chat server is running on port 3002"
echo "   3. OpenAI API key is set in .env"
echo "   4. Browser console for any errors"
echo ""
