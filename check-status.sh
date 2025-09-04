#!/bin/bash

echo "🔍 HOWPARTH Chat System Status Check"
echo "===================================="
echo ""

# Check React app
echo "📱 React App Status:"
if curl -s http://localhost:3001 > /dev/null; then
    echo "   ✅ React app is running on http://localhost:3001"
else
    echo "   ❌ React app is NOT running on http://localhost:3001"
    echo "   💡 Start it with: npm start"
fi
echo ""

# Check Chat Server
echo "💬 Chat Server Status:"
if curl -s http://localhost:3002/health > /dev/null; then
    echo "   ✅ Chat server is running on http://localhost:3002"
    
    # Test chat endpoint
    echo "   🧪 Testing chat endpoint..."
    response=$(curl -s -X POST http://localhost:3002/api/chat -H "Content-Type: application/json" -d '{"message":"test","userId":"status-check"}')
    if echo "$response" | grep -q "success.*true"; then
        echo "   ✅ Chat endpoint is working"
    else
        echo "   ❌ Chat endpoint is not responding correctly"
    fi
else
    echo "   ❌ Chat server is NOT running on http://localhost:3002"
    echo "   💡 Start it with: ./start-chat-server.sh"
fi
echo ""

# Check Chat Page
echo "🌐 Chat Page Status:"
if curl -s http://localhost:3001/chat > /dev/null; then
    echo "   ✅ Chat page is accessible at http://localhost:3001/chat"
else
    echo "   ❌ Chat page is NOT accessible"
fi
echo ""

# Summary
echo "📊 SUMMARY:"
echo "==========="
if curl -s http://localhost:3001 > /dev/null && curl -s http://localhost:3002/health > /dev/null; then
    echo "🎉 ALL SYSTEMS WORKING!"
    echo "   Your chat is ready at: http://localhost:3001/chat"
else
    echo "⚠️  Some systems need attention:"
    echo "   1. Make sure React app is running: npm start"
    echo "   2. Make sure chat server is running: ./start-chat-server.sh"
fi
echo ""
