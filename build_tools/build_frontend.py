#!/usr/bin/env python3
"""
Frontend build script.
This script builds the React frontend application for production.
"""

import os
import sys
import subprocess
import platform
import shutil
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
    ]
)
logger = logging.getLogger(__name__)

def build_frontend():
    """Build the React frontend for production"""
    # Get project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    frontend_dir = os.path.join(project_dir, 'frontend')
    
    logger.info(f"Building frontend from: {frontend_dir}")
    
    # Check if frontend directory exists
    if not os.path.exists(frontend_dir):
        logger.error(f"Frontend directory not found: {frontend_dir}")
        return False
    
    # Change to frontend directory
    os.chdir(frontend_dir)
    
    # Determine the commands to run based on platform
    npm_cmd = 'npm.cmd' if platform.system() == 'Windows' else 'npm'
    
    try:
        # Install dependencies
        logger.info("Installing frontend dependencies...")
        subprocess.run([npm_cmd, 'install'], 
                     check=True, 
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
        
        # Build frontend
        logger.info("Building frontend for production...")
        subprocess.run([npm_cmd, 'run', 'build'], 
                     check=True,
                     env={**os.environ, 'NODE_ENV': 'production'},
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
        
        # Check if build was successful
        dist_dir = os.path.join(frontend_dir, 'dist')
        if not os.path.exists(dist_dir):
            logger.error("Frontend build failed: dist directory not found")
            return False
        
        logger.info(f"Frontend built successfully at: {dist_dir}")
        return dist_dir
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Error building frontend: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    except Exception as e:
        logger.error(f"Unknown error building frontend: {e}")
        return False

if __name__ == "__main__":
    success = build_frontend()
    if not success:
        sys.exit(1)
    sys.exit(0)