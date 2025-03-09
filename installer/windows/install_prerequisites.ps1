# JobFit Windows Prerequisites Installer
# This script installs the prerequisites needed to build JobFit on Windows

Write-Output "Installing prerequisites for building JobFit on Windows..."

# Check if PowerShell is running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script needs to be run as Administrator. Please restart PowerShell as Administrator and try again."
    exit 1
}

# Create a temporary directory for downloads
$tempDir = [System.IO.Path]::GetTempPath() + [System.Guid]::NewGuid().ToString()
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # Install Inno Setup (for creating Windows installer)
    $innoSetupUrl = "https://files.jrsoftware.org/is/6/innosetup-6.2.1.exe"
    $innoSetupInstaller = "$tempDir\innosetup-installer.exe"
    
    Write-Output "Downloading Inno Setup..."
    Invoke-WebRequest -Uri $innoSetupUrl -OutFile $innoSetupInstaller
    
    Write-Output "Installing Inno Setup..."
    Start-Process -FilePath $innoSetupInstaller -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART" -Wait
    
    # Check if Inno Setup was installed successfully
    if (Test-Path "C:\Program Files (x86)\Inno Setup 6\ISCC.exe") {
        Write-Output "Inno Setup installed successfully."
    } else {
        Write-Error "Failed to install Inno Setup."
        exit 1
    }
    
    # Check if Python is installed
    try {
        $pythonVersion = python --version
        Write-Output "Python is installed: $pythonVersion"
    } catch {
        Write-Warning "Python is not installed or not in PATH."
        Write-Output "Please install Python 3.10 or higher from https://www.python.org/downloads/"
    }
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-Output "Node.js is installed: $nodeVersion"
        Write-Output "npm is installed: $npmVersion"
    } catch {
        Write-Warning "Node.js is not installed or not in PATH."
        Write-Output "Please install Node.js 16 or higher from https://nodejs.org/"
    }
    
    Write-Output "Prerequisites installation completed."
    
} finally {
    # Clean up
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}