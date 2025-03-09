#!/bin/bash
# JobFit Linux Prerequisites Installer
# This script installs the prerequisites needed to build JobFit on Linux

echo "Installing prerequisites for building JobFit on Linux..."

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    echo "Could not detect Linux distribution."
    DISTRO="unknown"
fi

echo "Detected Linux distribution: $DISTRO"

# Install dependencies based on distribution
case $DISTRO in
    ubuntu|debian|pop|linuxmint)
        echo "Installing dependencies for Ubuntu/Debian-based distribution..."
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-dev python3-tk nodejs npm fuse
        ;;
    fedora|rhel|centos)
        echo "Installing dependencies for Fedora/RHEL-based distribution..."
        sudo dnf update
        sudo dnf install -y python3 python3-pip python3-devel python3-tkinter nodejs npm fuse
        ;;
    arch|manjaro)
        echo "Installing dependencies for Arch-based distribution..."
        sudo pacman -Syu
        sudo pacman -S --needed python python-pip tk nodejs npm fuse2
        ;;
    *)
        echo "Unsupported Linux distribution: $DISTRO"
        echo "Please manually install the following dependencies:"
        echo "- Python 3 with pip and tkinter"
        echo "- Node.js with npm"
        echo "- FUSE for AppImage support"
        ;;
esac

# Install AppImageTool
echo "Installing AppImageTool..."
APPIMAGETOOL_URL="https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
APPIMAGETOOL_PATH="/usr/local/bin/appimagetool"

# Download AppImageTool
sudo curl -L $APPIMAGETOOL_URL -o $APPIMAGETOOL_PATH
sudo chmod +x $APPIMAGETOOL_PATH

# Check if AppImageTool was installed successfully
if command -v appimagetool &> /dev/null; then
    echo "AppImageTool installed successfully."
else
    echo "Failed to install AppImageTool. Please install it manually."
fi

# Install Pillow for icon conversion
echo "Installing Pillow for icon conversion..."
pip3 install pillow

echo "Prerequisites installation completed."#!/bin/bash
# JobFit Linux Prerequisites Installer
# This script installs the prerequisites needed to build JobFit on Linux

echo "Installing prerequisites for building JobFit on Linux..."

# Detect Linux distribution
if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO=$ID
else
    echo "Could not detect Linux distribution."
    DISTRO="unknown"
fi

echo "Detected Linux distribution: $DISTRO"

# Install dependencies based on distribution
case $DISTRO in
    ubuntu|debian|pop|linuxmint)
        echo "Installing dependencies for Ubuntu/Debian-based distribution..."
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip python3-dev python3-tk nodejs npm fuse
        ;;
    fedora|rhel|centos)
        echo "Installing dependencies for Fedora/RHEL-based distribution..."
        sudo dnf update
        sudo dnf install -y python3 python3-pip python3-devel python3-tkinter nodejs npm fuse
        ;;
    arch|manjaro)
        echo "Installing dependencies for Arch-based distribution..."
        sudo pacman -Syu
        sudo pacman -S --needed python python-pip tk nodejs npm fuse2
        ;;
    *)
        echo "Unsupported Linux distribution: $DISTRO"
        echo "Please manually install the following dependencies:"
        echo "- Python 3 with pip and tkinter"
        echo "- Node.js with npm"
        echo "- FUSE for AppImage support"
        ;;
esac

# Install AppImageTool
echo "Installing AppImageTool..."
APPIMAGETOOL_URL="https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage"
APPIMAGETOOL_PATH="/usr/local/bin/appimagetool"

# Download AppImageTool
sudo curl -L $APPIMAGETOOL_URL -o $APPIMAGETOOL_PATH
sudo chmod +x $APPIMAGETOOL_PATH

# Check if AppImageTool was installed successfully
if command -v appimagetool &> /dev/null; then
    echo "AppImageTool installed successfully."
else
    echo "Failed to install AppImageTool. Please install it manually."
fi

# Install Pillow for icon conversion
echo "Installing Pillow for icon conversion..."
pip3 install pillow

echo "Prerequisites installation completed."