#!/bin/bash

echo "🚀 Starting HOWPARTH Network Servers..."
echo "========================================"

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "react-scripts" 2>/dev/null || true
lsof -ti:3000,3001 | xargs kill -9 2>/dev/null || true

echo "🔧 Starting Backend Server..."
node server/index.js &
BACKEND_PID=$!

sleep 3

echo "⚛️ Starting React Frontend..."
HOST=0.0.0.0 PORT=3000 npm start &
FRONTEND_PID=$!

sleep 5

echo ""
echo "=== SERVER STATUS ==="
echo "🌐 Backend: http://localhost:3001"
echo "🌍 Backend Network: http://192.168.1.7:3001"
echo "⚛️ Frontend: http://localhost:3000"
echo "🌐 Frontend Network: http://192.168.1.7:3000"
echo ""
echo "📊 Health Check: http://localhost:3001/health"
echo ""
echo "✅ Servers starting in background!"
echo "⏹️ To stop: pkill -f 'node.*server' && pkill -f 'react-scripts'"
