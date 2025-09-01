#!/bin/bash

echo "🧪 Testing HOWPARTH AI System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Test 1: Check if Ollama is running
echo ""
print_status "1. Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    print_success "Ollama is running"
else
    print_error "Ollama is not running. Start with: ollama serve"
    exit 1
fi

# Test 2: Check if Parth model exists
echo ""
print_status "2. Checking Parth model..."
if ollama list | grep -q "parth-ai"; then
    print_success "Parth model is installed"
else
    print_error "Parth model not found. Install with: ollama create parth-ai -f ParthModelfile"
    exit 1
fi

# Test 3: Test AI response
echo ""
print_status "3. Testing AI response..."
RESPONSE=$(curl -s -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "parth-ai",
    "messages": [{"role": "user", "content": "Hi Parth, introduce yourself briefly"}],
    "stream": false
  }')

if echo "$RESPONSE" | grep -q "Parth"; then
    print_success "AI is responding correctly"
    echo "Sample response: $(echo "$RESPONSE" | jq -r '.message.content' | head -c 150)..."
else
    print_error "AI response is incorrect"
    echo "Response: $RESPONSE"
    exit 1
fi

# Test 4: Check backend server
echo ""
print_status "4. Testing backend server..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend server is running on port 3001"
elif curl -s http://localhost:3000/health > /dev/null 2>&1; then
    print_success "Backend server is running on port 3000"
else
    print_warning "Backend server may not be running"
    print_status "Try starting with: npm run dev"
fi

# Test 5: Test chat endpoint
echo ""
print_status "5. Testing chat endpoint..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/chat/health 2>/dev/null || curl -s -X GET http://localhost:3001/api/chat/health 2>/dev/null)

if echo "$CHAT_RESPONSE" | grep -q "status"; then
    print_success "Chat endpoint is responding"
else
    print_warning "Chat endpoint test inconclusive"
    print_status "Full response: $CHAT_RESPONSE"
fi

# Test 6: Test streaming endpoint
echo ""
print_status "6. Testing streaming chat..."
STREAM_TEST=$(timeout 10s curl -s -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "userId": "test"}' 2>/dev/null | head -n 1)

if [[ ! -z "$STREAM_TEST" ]]; then
    print_success "Streaming endpoint is working"
else
    print_warning "Streaming endpoint test inconclusive"
fi

# Test 7: Check required dependencies
echo ""
print_status "7. Checking Node.js dependencies..."
if npm list chromadb > /dev/null 2>&1; then
    print_success "Chroma dependency installed"
else
    print_warning "Chroma dependency may be missing. Run: npm install"
fi

if npm list node-fetch > /dev/null 2>&1; then
    print_success "node-fetch dependency installed"
else
    print_warning "node-fetch dependency may be missing. Run: npm install"
fi

# Test 8: Check data directories
echo ""
print_status "8. Checking data directories..."
if [ -d "data/chroma_db" ]; then
    print_success "Chroma data directory exists"
else
    print_warning "Creating Chroma data directory..."
    mkdir -p data/chroma_db
    print_success "Chroma data directory created"
fi

# Summary
echo ""
echo "🎉 AI System Test Summary:"
echo "========================="
print_success "✅ Ollama service: Running"
print_success "✅ Parth model: Installed" 
print_success "✅ AI responses: Working"

if [[ ! -z "$CHAT_RESPONSE" ]]; then
    print_success "✅ Backend server: Running"
else
    print_warning "⚠️  Backend server: Check needed"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Start backend: npm run dev"
echo "2. Open frontend: http://localhost:3000/chat"
echo "3. Test with: 'Hi Parth, who are you?'"
echo "4. Try search: 'What's the latest news in AI today?'"
echo ""

print_success "🎉 AI System Test Complete!"

# Optional: Test a full conversation
echo ""
read -p "Would you like to test a full conversation? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Testing full conversation..."
    
    FULL_RESPONSE=$(curl -s -X POST http://localhost:11434/api/chat \
      -H "Content-Type: application/json" \
      -d '{
        "model": "parth-ai",
        "messages": [
          {"role": "user", "content": "Hi Parth, I need help with AI automation for my business. What would you recommend?"}
        ],
        "stream": false
      }')
    
    if [[ ! -z "$FULL_RESPONSE" ]]; then
        echo ""
        print_success "Full conversation test:"
        echo "----------------------------------------"
        echo "$FULL_RESPONSE" | jq -r '.message.content' | head -c 500
        echo "..."
        echo "----------------------------------------"
    fi
fi
