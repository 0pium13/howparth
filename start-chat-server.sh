#!/bin/bash

echo "🚀 Starting HOWPARTH Chat Server..."
echo "=================================="

# Navigate to the correct directory
cd /Users/opium/HOWPARTH/howparth

# Check if the server file exists
if [ ! -f "quick-chat-fix.js" ]; then
    echo "❌ Error: quick-chat-fix.js not found!"
    echo "   Make sure you're in the correct directory: /Users/opium/HOWPARTH/howparth"
    exit 1
fi

# Kill any existing server on port 3002
echo "🔄 Checking for existing servers..."
lsof -ti:3002 | xargs kill -9 2>/dev/null || echo "   No existing server found"

# Start the chat server
echo "🚀 Starting chat server on port 3002..."
node quick-chat-fix.js
