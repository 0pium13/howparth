#!/bin/bash

echo "🚀 Setting up HOWPARTH AI system..."

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

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    print_status "Detected macOS"
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        print_error "Homebrew is not installed. Please install it first:"
        echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    # Install Ollama using Homebrew
    print_status "Installing Ollama..."
    brew install ollama
    
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_status "Detected Linux"
    
    # Install Ollama on Linux
    print_status "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    
else
    print_error "Unsupported operating system. Please install Ollama manually from https://ollama.com"
    exit 1
fi

# Start Ollama service
print_status "Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
print_status "Waiting for Ollama to start..."
sleep 5

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    print_error "Failed to start Ollama. Please check the installation."
    exit 1
fi

print_success "Ollama is running!"

# Pull required models
print_status "Downloading AI models..."
print_warning "This may take a while depending on your internet connection..."

# Pull the main model
ollama pull llama3.2:7b-instruct
if [ $? -eq 0 ]; then
    print_success "Downloaded llama3.2:7b-instruct"
else
    print_error "Failed to download llama3.2:7b-instruct"
fi

# Pull embedding model for vector search
ollama pull nomic-embed-text
if [ $? -eq 0 ]; then
    print_success "Downloaded nomic-embed-text"
else
    print_warning "Failed to download nomic-embed-text (optional for basic functionality)"
fi

# Create data directory
print_status "Creating data directories..."
mkdir -p data/chroma_db
mkdir -p logs

# Set up environment file
if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp env.ai.example .env
    print_warning "Please edit .env file and add your Brave API key"
    print_warning "Get a free API key at: https://api.search.brave.com/"
else
    print_status ".env file already exists"
fi

# Install Node.js dependencies
print_status "Installing Node.js dependencies..."
npm install

# Test the setup
print_status "Testing AI setup..."

# Test Ollama
if curl -s http://localhost:11434/api/tags | grep -q "llama3.2"; then
    print_success "Ollama is working correctly!"
else
    print_error "Ollama test failed. Please check the installation."
fi

# Create startup script
cat > start-ai.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting HOWPARTH AI system..."

# Start Ollama in background
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to start
sleep 3

# Start the Node.js server
npm run dev

# Cleanup on exit
trap "kill $OLLAMA_PID; exit" INT TERM
wait
EOF

chmod +x start-ai.sh

print_success "✅ AI setup complete!"
echo ""
echo "🎉 Next steps:"
echo "1. Edit .env file and add your Brave API key"
echo "2. Run: ./start-ai.sh"
echo "3. Open http://localhost:3000/chat"
echo ""
echo "📚 Documentation:"
echo "- Ollama: https://ollama.com"
echo "- Brave Search API: https://api.search.brave.com/"
echo "- HOWPARTH Chat: http://localhost:3000/chat"
echo ""
print_warning "Note: Keep Ollama running for AI features to work!"

# Stop Ollama service
kill $OLLAMA_PID 2>/dev/null

echo ""
print_success "Setup script completed successfully!"
