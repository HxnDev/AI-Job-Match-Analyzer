#!/usr/bin/env python3
"""
Main build script.
This script coordinates all build steps to create a standalone application.
"""

import os
import sys
import platform
import logging
import argparse

# Add the project root to the Python path
script_dir = os.path.dirname(os.path.abspath(__file__))
project_dir = os.path.dirname(script_dir)
sys.path.insert(0, project_dir)

# Import build modules
from build_tools.build_frontend import build_frontend
from build_tools.package_backend import package_backend
from build_tools.create_installer import create_installer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger(__name__)

def parse_args():
    """Parse command-line arguments"""
    parser = argparse.ArgumentParser(description="Build JobFit standalone application")
    parser.add_argument('--skip-frontend', action='store_true', help="Skip frontend build")
    parser.add_argument('--skip-backend', action='store_true', help="Skip backend packaging")
    parser.add_argument('--skip-installer', action='store_true', help="Skip installer creation")
    return parser.parse_args()

def main():
    """Main build function"""
    logger.info(f"Starting JobFit build process for {platform.system()}")
    
    args = parse_args()
    
    # Create dist directory if it doesn't exist
    dist_dir = os.path.join(project_dir, 'dist')
    os.makedirs(dist_dir, exist_ok=True)
    
    # Step 1: Build frontend
    frontend_dist = None
    if not args.skip_frontend:
        logger.info("Step 1: Building frontend...")
        frontend_dist = build_frontend()
        if not frontend_dist:
            logger.error("Frontend build failed.")
            return False
        logger.info(f"Frontend build successful: {frontend_dist}")
    else:
        logger.info("Skipping frontend build.")
        # Check if frontend dist already exists
        default_frontend_dist = os.path.join(project_dir, 'frontend', 'dist')
        if os.path.exists(default_frontend_dist):
            frontend_dist = default_frontend_dist
            logger.info(f"Using existing frontend dist: {frontend_dist}")
    
    # Step 2: Package backend
    executable_path = None
    if not args.skip_backend:
        logger.info("Step 2: Packaging backend...")
        executable_path = package_backend(frontend_dist)
        if not executable_path:
            logger.error("Backend packaging failed.")
            return False
        logger.info(f"Backend packaging successful: {executable_path}")
    else:
        logger.info("Skipping backend packaging.")
        # Check if executable already exists
        if platform.system() == 'Windows':
            default_executable = os.path.join(dist_dir, 'JobFit.exe')
        else:
            default_executable = os.path.join(dist_dir, 'JobFit')
        
        if os.path.exists(default_executable):
            executable_path = default_executable
            logger.info(f"Using existing executable: {executable_path}")
        else:
            logger.error("No executable found. Cannot proceed with installer creation.")
            if not args.skip_installer:
                return False
    
    # Step 3: Create installer
    if not args.skip_installer and executable_path:
        logger.info("Step 3: Creating installer...")
        installer_path = create_installer(executable_path)
        if not installer_path:
            logger.error("Installer creation failed.")
            return False
        logger.info(f"Installer creation successful: {installer_path}")
    elif args.skip_installer:
        logger.info("Skipping installer creation.")
    
    logger.info("Build process completed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)