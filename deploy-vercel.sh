#!/bin/bash

echo "🚀 Deploying HOWPARTH to Vercel..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in the right directory"
    exit 1
fi

# Build the project
echo -e "${YELLOW}📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed"
    exit 1
fi

echo -e "${GREEN}✅ Build successful"

# Deploy to Vercel
echo -e "${YELLOW}🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment successful!"
    echo -e "${GREEN}🌐 Your app is now live on Vercel!"
else
    echo -e "${RED}❌ Deployment failed"
    exit 1
fi
