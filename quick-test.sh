#!/bin/bash

echo "🔍 QUICK WEBSITE TEST"
echo "===================="

# Test backend
echo ""
echo "📡 Testing Backend (port 3001):"
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running"
    # Test API endpoints
    if curl -s http://localhost:3001/api/monitoring/health > /dev/null; then
        echo "✅ API endpoints working"
    else
        echo "❌ API endpoints not working"
    fi
else
    echo "❌ Backend not running"
fi

# Test frontend
echo ""
echo "🌐 Testing Frontend (port 3000):"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ React app is running"
else
    echo "❌ React app not running"
fi

echo ""
echo "📋 ACCESS URLs:"
echo "=============="
echo "🌐 Website: http://localhost:3000"
echo "🔐 Login: http://localhost:3000/login"
echo "📝 Signup: http://localhost:3000/signup"
echo "💬 Chat: http://localhost:3000/chat"
echo "📊 Admin: http://localhost:3000/admin"
echo ""
echo "🔑 Admin Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
