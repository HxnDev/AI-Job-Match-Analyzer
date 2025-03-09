# JobFit Build Tools

This directory contains the scripts needed to build and package the JobFit application.

## Overview

The build process consists of several steps:
1. Building the frontend React application
2. Packaging the Flask backend as an executable
3. Creating platform-specific installers

## Scripts

- `build_frontend.py`: Builds the React frontend to static files
- `package_backend.py`: Uses PyInstaller to package the backend with the frontend
- `create_installer.py`: Creates platform-specific installers
- `build_all.py`: Orchestrates the entire build process

## Requirements

To use these build tools, you'll need:

### For Windows builds:
- Python 3.11 or higher
- Node.js 14 or higher
- Inno Setup (for creating Windows installers)

### For macOS builds:
- Python 3.11 or higher
- Node.js 14 or higher
- create-dmg (installable via Homebrew)

### For Linux builds:
- Python 3.11 or higher
- Node.js 14 or higher
- AppImageTool (for creating AppImages)

## Usage

Run the main build script:

```bash
python build_all.py
```

This will create platform-specific packages in the `dist` directory.