#!/usr/bin/env python3
"""
Backend packaging script.
This script packages the Flask backend application using PyInstaller.
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

def package_backend(frontend_dist=None):
    """
    Package the Flask backend using PyInstaller.
    
    Args:
        frontend_dist: Path to the frontend dist directory
    
    Returns:
        str or bool: Path to the created executable if successful, False otherwise
    """
    # Get project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    backend_dir = os.path.join(project_dir, 'backend')
    
    # Check if backend directory exists
    if not os.path.exists(backend_dir):
        logger.error(f"Backend directory not found: {backend_dir}")
        return False
    
    # Check if frontend dist is provided and exists
    if frontend_dist and not os.path.exists(frontend_dist):
        logger.error(f"Frontend dist directory not found: {frontend_dist}")
        return False
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Make sure PyInstaller is installed
    try:
        logger.info("Installing PyInstaller...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'pyinstaller'], 
                     check=True,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error installing PyInstaller: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    
    # Determine platform-specific settings
    if platform.system() == 'Windows':
        executable_name = 'JobFit.exe'
        icon_path = os.path.join(project_dir, 'frontend', 'public', 'favicon.ico')
    else:
        executable_name = 'JobFit'
        icon_path = os.path.join(project_dir, 'frontend', 'public', 'favicon.ico')
    
    # Create the spec file content
    spec_content = f"""# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['{os.path.join(backend_dir, 'app', 'main.py').replace('\\', '\\\\')}'],
    pathex=['{backend_dir.replace('\\', '\\\\')}'],
    binaries=[],
    datas=["""
    
    # Add frontend dist if provided
    if frontend_dist:
        spec_content += f"""
        ('{frontend_dist.replace('\\', '\\\\')}', 'frontend/dist'),"""
    
    # Add other necessary data files
    spec_content += f"""
    ],
    hiddenimports=[
        'flask',
        'flask_cors',
        'google.generativeai',
        'app',
        'app.routes',
        'app.resume_analyzer',
        'app.cover_letter',
        'app.email_reply',
        'app.ats_analyzer',
        'app.learning_recommender',
        'app.interview_preparer',
        'app.interview_evaluator',
        'app.motivational_message',
        'app.api_key_setup',
        'app.frontend',
    ],
    hookspath=[],
    hooksconfig={{}},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='{executable_name}',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,"""
    
    # Add icon if it exists
    if os.path.exists(icon_path):
        spec_content += f"""
    icon='{icon_path.replace('\\', '\\\\')}',"""
    
    spec_content += """
)
"""
    
    # Write the spec file
    spec_path = os.path.join(backend_dir, 'JobFit.spec')
    with open(spec_path, 'w') as f:
        f.write(spec_content)
    
    # Run PyInstaller
    logger.info("Running PyInstaller to package backend...")
    try:
        subprocess.run([sys.executable, '-m', 'PyInstaller', spec_path, '--clean'],
                     check=True,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running PyInstaller: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    
    # Check if executable was created
    dist_dir = os.path.join(backend_dir, 'dist')
    executable_path = os.path.join(dist_dir, executable_name)
    
    if not os.path.exists(executable_path):
        logger.error(f"Executable not found at: {executable_path}")
        return False
    
    # Copy executable to project dist directory
    project_dist_dir = os.path.join(project_dir, 'dist')
    os.makedirs(project_dist_dir, exist_ok=True)
    
    target_path = os.path.join(project_dist_dir, executable_name)
    shutil.copy2(executable_path, target_path)
    
    logger.info(f"Backend packaged successfully at: {target_path}")
    return target_path

if __name__ == "__main__":
    # Check if frontend dist path is provided as an argument
    frontend_dist = None
    if len(sys.argv) > 1:
        frontend_dist = sys.argv[1]
    
    success = package_backend(frontend_dist)
    if not success:
        sys.exit(1)
    sys.exit(0)