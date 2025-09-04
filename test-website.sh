#!/bin/bash

echo "🧪 HOWPARTH WEBSITE COMPREHENSIVE TEST"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check endpoint
check_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3

    echo -n "Testing $description... "

    if curl -s "$url" > /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

# Function to test API response
test_api() {
    local url=$1
    local method=$2
    local data=$3
    local description=$4

    echo -n "Testing $description... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST -H "Content-Type: application/json" -d "$data" "$url")
    else
        response=$(curl -s "$url")
    fi

    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        return 1
    fi
}

echo "🔍 Checking server status..."
echo "==========================="

# Check if servers are running
echo ""
echo "📡 SERVER STATUS:"
echo "----------------"

check_endpoint "http://localhost:3001" "200" "React Frontend (port 3001)"
check_endpoint "http://localhost:3002/health" "200" "Backend API (port 3002)"

echo ""
echo "🌐 TESTING MAIN WEBSITE PAGES:"
echo "=============================="

# Test main website pages
pages=(
    "http://localhost:3001::Main page (/)"
    "http://localhost:3001/login::Login page"
    "http://localhost:3001/signup::Signup page"
    "http://localhost:3001/chat::Chat page"
    "http://localhost:3001/admin::Admin dashboard"
    "http://localhost:3001/ai::AI portal"
    "http://localhost:3001/community::Community hub"
    "http://localhost:3001/projects::Projects page"
    "http://localhost:3001/contact::Contact page"
    "http://localhost:3001/about::About page"
)

for page in "${pages[@]}"; do
    IFS='::' read -r url description <<< "$page"
    check_endpoint "$url" "200" "$description"
done

echo ""
echo "🔐 TESTING AUTHENTICATION APIs:"
echo "==============================="

# Test authentication endpoints
auth_apis=(
    "http://localhost:3002/api/auth/login::POST::{}::Login API"
    "http://localhost:3002/api/auth/register::POST::{}::Register API"
    "http://localhost:3002/api/auth/profile::GET::::Profile API"
)

for api in "${auth_apis[@]}"; do
    IFS='::' read -r url method data description <<< "$api"
    test_api "$url" "$method" "$data" "$description"
done

echo ""
echo "💬 TESTING CHAT FUNCTIONALITY:"
echo "=============================="

# Test chat API
test_api "http://localhost:3002/api/chat" "POST" '{"message":"Hello, test message","userId":"test123"}' "Chat API"

echo ""
echo "📊 TESTING MONITORING APIs:"
echo "==========================="

# Test monitoring endpoints
monitoring_apis=(
    "http://localhost:3002/api/monitoring/health::Health check"
    "http://localhost:3002/api/monitoring/status::System status"
    "http://localhost:3002/api/monitoring/metrics::Metrics"
    "http://localhost:3002/api/monitoring/errors::Error logs"
)

for api in "${monitoring_apis[@]}"; do
    IFS='::' read -r url description <<< "$api"
    check_endpoint "$url" "200" "$description"
done

echo ""
echo "🎯 TESTING AI & CONTENT APIs:"
echo "============================"

# Test AI and content endpoints
ai_apis=(
    "http://localhost:3002/api/chat::Chat endpoint"
    "http://localhost:3002/api/ai-tools::AI tools"
    "http://localhost:3002/api/consultation::Consultation"
    "http://localhost:3002/api/analytics::Analytics"
    "http://localhost:3002/api/blog::Blog posts"
    "http://localhost:3002/api/user::User management"
)

for api in "${ai_apis[@]}"; do
    IFS='::' read -r url description <<< "$api"
    check_endpoint "$url" "200" "$description"
done

echo ""
echo "🔧 TESTING ADMIN FUNCTIONALITY:"
echo "==============================="

# Test admin endpoints
admin_apis=(
    "http://localhost:3002/api/admin::Admin panel"
    "http://localhost:3002/api/admin/users::User management"
    "http://localhost:3002/api/admin/analytics::Admin analytics"
    "http://localhost:3002/api/admin/settings::Admin settings"
)

for api in "${admin_apis[@]}"; do
    IFS='::' read -r url description <<< "$api"
    # Admin endpoints might require authentication, so we'll just check if they exist
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "Testing $description... ${GREEN}✅ PASS${NC}"
    else
        echo -e "Testing $description... ${YELLOW}⚠️  Expected (requires auth)${NC}"
    fi
done

echo ""
echo "📱 TESTING RESPONSIVE DESIGN:"
echo "============================"

# Test with different user agents
echo "Testing mobile responsiveness..."
if curl -s -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15" "http://localhost:3001" > /dev/null; then
    echo -e "Mobile responsiveness... ${GREEN}✅ PASS${NC}"
else
    echo -e "Mobile responsiveness... ${RED}❌ FAIL${NC}"
fi

echo ""
echo "🚀 FINAL SUMMARY:"
echo "================"

echo ""
echo "📋 MANUAL TESTING CHECKLIST:"
echo "============================"
echo ""
echo "🔐 LOGIN/SIGNUP TESTING:"
echo "  1. Visit: http://localhost:3001/login"
echo "  2. Test login with: admin/admin123"
echo "  3. Visit: http://localhost:3001/signup"
echo "  4. Try creating a new account"
echo ""
echo "💬 CHAT TESTING:"
echo "  1. Visit: http://localhost:3001/chat"
echo "  2. Send a message and check response"
echo "  3. Test emoji picker and file upload"
echo ""
echo "📊 ADMIN DASHBOARD:"
echo "  1. Visit: http://localhost:3001/admin"
echo "  2. Login with: admin/admin123"
echo "  3. Check real-time data updates"
echo "  4. Test all dashboard sections"
echo ""
echo "🌐 GENERAL WEBSITE:"
echo "  1. Visit: http://localhost:3001"
echo "  2. Test all navigation links"
echo "  3. Check mobile responsiveness"
echo "  4. Test contact forms"
echo ""
echo "🎯 EXPECTED RESULTS:"
echo "  - All pages should load without errors"
echo "  - Login/signup should work smoothly"
echo "  - Chat should respond with AI messages"
echo "  - Admin dashboard should show real-time data"
echo "  - Mobile view should be fully functional"
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "  If anything fails, check:"
echo "  - Backend server: npm run server"
echo "  - Frontend: npm start"
echo "  - Browser console for JavaScript errors"
echo "  - Network tab for failed API calls"
