#!/bin/bash
# JobFit macOS Prerequisites Installer
# This script installs the prerequisites needed to build JobFit on macOS

echo "Installing prerequisites for building JobFit on macOS..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Homebrew not found. Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Make sure Homebrew is in PATH
    if [[ $(uname -m) == 'arm64' ]]; then
        # M1/M2 Mac
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    else
        # Intel Mac
        echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/usr/local/bin/brew shellenv)"
    fi
    
    echo "Homebrew installed successfully."
else
    echo "Homebrew is already installed. Updating..."
    brew update
fi

# Install Python if needed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 not found. Installing Python 3..."
    brew install python
else
    echo "Python 3 is already installed: $(python3 --version)"
fi

# Install Node.js if needed
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing Node.js..."
    brew install node
else
    echo "Node.js is already installed: $(node --version)"
    echo "npm is already installed: $(npm --version)"
fi

# Install create-dmg for creating macOS DMG installers
if ! command -v create-dmg &> /dev/null; then
    echo "Installing create-dmg..."
    brew install create-dmg
else
    echo "create-dmg is already installed."
fi

# Install Pillow for icon conversion
echo "Installing Pillow for icon conversion..."
pip3 install pillow

echo "Prerequisites installation completed."