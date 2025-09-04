#!/bin/bash

# Ollama Cleanup Script for HOWPARTH
# This script completely removes Ollama from the system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  OLLAMA CLEANUP SCRIPT${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    print_error "Unsupported operating system: $OSTYPE"
    exit 1
fi

print_header

print_status "Starting Ollama cleanup process..."
print_warning "This will completely remove Ollama from your system"
echo ""

# Check if Ollama is running
print_status "Checking if Ollama is running..."
if pgrep -f "ollama" > /dev/null; then
    print_warning "Ollama is currently running. Stopping Ollama service..."
    
    # Stop Ollama service
    if command -v ollama > /dev/null; then
        ollama stop 2>/dev/null || true
    fi
    
    # Kill any remaining Ollama processes
    pkill -f "ollama" 2>/dev/null || true
    sleep 2
    
    print_success "Ollama service stopped"
else
    print_success "Ollama is not running"
fi

# Remove Ollama binary
print_status "Removing Ollama binary..."
if command -v ollama > /dev/null; then
    OLLAMA_PATH=$(which ollama)
    print_status "Found Ollama at: $OLLAMA_PATH"
    
    if [[ "$OS" == "macos" ]]; then
        # Remove from Homebrew if installed via brew
        if brew list ollama > /dev/null 2>&1; then
            print_status "Removing Ollama via Homebrew..."
            brew uninstall ollama
        fi
        
        # Remove from /usr/local/bin if exists
        if [[ -f "/usr/local/bin/ollama" ]]; then
            sudo rm -f /usr/local/bin/ollama
        fi
    elif [[ "$OS" == "linux" ]]; then
        # Remove from /usr/local/bin
        if [[ -f "/usr/local/bin/ollama" ]]; then
            sudo rm -f /usr/local/bin/ollama
        fi
        
        # Remove from /usr/bin if exists
        if [[ -f "/usr/bin/ollama" ]]; then
            sudo rm -f /usr/bin/ollama
        fi
    fi
    
    print_success "Ollama binary removed"
else
    print_success "Ollama binary not found (already removed)"
fi

# Remove Ollama data directory
print_status "Removing Ollama data directory..."
if [[ -d "$HOME/.ollama" ]]; then
    print_status "Found Ollama data at: $HOME/.ollama"
    print_warning "This will remove all downloaded models and data"
    
    # Get size of directory
    SIZE=$(du -sh "$HOME/.ollama" 2>/dev/null | cut -f1 || echo "unknown")
    print_status "Directory size: $SIZE"
    
    rm -rf "$HOME/.ollama"
    print_success "Ollama data directory removed"
else
    print_success "Ollama data directory not found"
fi

# Remove Ollama from PATH
print_status "Cleaning up PATH configuration..."
SHELL_CONFIG=""

if [[ "$SHELL" == *"zsh"* ]]; then
    SHELL_CONFIG="$HOME/.zshrc"
elif [[ "$SHELL" == *"bash"* ]]; then
    SHELL_CONFIG="$HOME/.bashrc"
fi

if [[ -n "$SHELL_CONFIG" && -f "$SHELL_CONFIG" ]]; then
    # Remove any Ollama-related PATH entries
    if grep -q "ollama" "$SHELL_CONFIG"; then
        print_status "Removing Ollama from $SHELL_CONFIG..."
        sed -i.bak '/ollama/d' "$SHELL_CONFIG"
        print_success "Ollama removed from shell configuration"
    else
        print_success "No Ollama references found in shell configuration"
    fi
fi

# Remove systemd service (Linux only)
if [[ "$OS" == "linux" ]]; then
    print_status "Removing systemd service..."
    if systemctl list-unit-files | grep -q ollama; then
        sudo systemctl stop ollama 2>/dev/null || true
        sudo systemctl disable ollama 2>/dev/null || true
        sudo rm -f /etc/systemd/system/ollama.service
        sudo systemctl daemon-reload
        print_success "Ollama systemd service removed"
    else
        print_success "No Ollama systemd service found"
    fi
fi

# Remove launchd service (macOS only)
if [[ "$OS" == "macos" ]]; then
    print_status "Removing launchd service..."
    if [[ -f "$HOME/Library/LaunchAgents/ollama.plist" ]]; then
        launchctl unload "$HOME/Library/LaunchAgents/ollama.plist" 2>/dev/null || true
        rm -f "$HOME/Library/LaunchAgents/ollama.plist"
        print_success "Ollama launchd service removed"
    else
        print_success "No Ollama launchd service found"
    fi
fi

# Clean up any remaining processes
print_status "Cleaning up any remaining Ollama processes..."
pkill -f "ollama" 2>/dev/null || true

# Verify removal
print_status "Verifying Ollama removal..."
if command -v ollama > /dev/null; then
    print_error "Ollama binary still exists!"
    exit 1
fi

if [[ -d "$HOME/.ollama" ]]; then
    print_error "Ollama data directory still exists!"
    exit 1
fi

if pgrep -f "ollama" > /dev/null; then
    print_error "Ollama processes still running!"
    exit 1
fi

print_success "Ollama has been completely removed from your system!"

echo ""
print_status "Cleanup Summary:"
echo "  ✅ Ollama service stopped"
echo "  ✅ Ollama binary removed"
echo "  ✅ Ollama data directory removed"
echo "  ✅ Shell configuration cleaned"
echo "  ✅ System services removed"
echo "  ✅ All processes terminated"

echo ""
print_success "Your system is now clean of Ollama!"
print_status "You can now use the enhanced OpenAI fine-tuned model system."
print_status "Monitor your chat system at: http://localhost:3001/monitoring.html"

echo ""
print_warning "Note: If you had any custom Ollama models, they have been removed."
print_warning "You can reinstall Ollama later if needed from: https://ollama.com"
