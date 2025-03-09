#!/usr/bin/env python3
"""
Installer creation script.
This script creates platform-specific installers for the packaged application.
"""

import os
import sys
import subprocess
import platform
import shutil
import tempfile
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

def create_windows_installer(executable_path):
    """
    Create a Windows installer using Inno Setup.
    
    Args:
        executable_path: Path to the executable file
        
    Returns:
        str or bool: Path to the installer if successful, False otherwise
    """
    if platform.system() != 'Windows':
        logger.warning("Windows installer can only be created on Windows")
        return False
    
    # Get project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    
    # Check if executable exists
    if not os.path.exists(executable_path):
        logger.error(f"Executable not found: {executable_path}")
        return False
    
    # Check if Inno Setup is installed
    inno_compiler = "C:\\Program Files (x86)\\Inno Setup 6\\ISCC.exe"
    if not os.path.exists(inno_compiler):
        logger.error(f"Inno Setup not found at: {inno_compiler}")
        return False
    
    # Create a temporary Inno Setup script
    with tempfile.NamedTemporaryFile(suffix='.iss', delete=False, mode='w') as f:
        script_path = f.name
        f.write(f"""#define MyAppName "JobFit"
#define MyAppVersion "1.0"
#define MyAppPublisher "JobFit"
#define MyAppURL "https://github.com/HxnDev/JobFit"
#define MyAppExeName "JobFit.exe"

[Setup]
AppId={{{{89F81CDF-5341-4B4D-A548-F0C57F91D7E1}}}}
AppName={{#MyAppName}}
AppVersion={{#MyAppVersion}}
AppPublisher={{#MyAppPublisher}}
AppPublisherURL={{#MyAppURL}}
AppSupportURL={{#MyAppURL}}
AppUpdatesURL={{#MyAppURL}}
DefaultDirName={{autopf}}\\{{#MyAppName}}
DisableProgramGroupPage=yes
OutputDir={project_dir}\\dist
OutputBaseFilename=JobFit_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{{cm:CreateDesktopIcon}}"; GroupDescription: "{{cm:AdditionalIcons}}"; Flags: unchecked

[Files]
Source: "{executable_path}"; DestDir: "{{app}}"; Flags: ignoreversion

[Icons]
Name: "{{autoprograms}}\\{{#MyAppName}}"; Filename: "{{app}}\\{{#MyAppExeName}}"
Name: "{{autodesktop}}\\{{#MyAppName}}"; Filename: "{{app}}\\{{#MyAppExeName}}"; Tasks: desktopicon

[Run]
Filename: "{{app}}\\{{#MyAppExeName}}"; Description: "{{cm:LaunchProgram,{{#StringChange(MyAppName, '&', '&&')}}}}"; Flags: nowait postinstall skipifsilent
""")
    
    # Run Inno Setup compiler
    logger.info("Running Inno Setup compiler...")
    try:
        subprocess.run([inno_compiler, script_path],
                     check=True,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error running Inno Setup: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        os.unlink(script_path)
        return False
    
    # Clean up temporary file
    os.unlink(script_path)
    
    # Check if installer was created
    installer_path = os.path.join(project_dir, 'dist', 'JobFit_Setup.exe')
    if not os.path.exists(installer_path):
        logger.error(f"Installer not found at: {installer_path}")
        return False
    
    logger.info(f"Windows installer created successfully at: {installer_path}")
    return installer_path

def create_macos_installer(executable_path):
    """
    Create a macOS DMG installer.
    
    Args:
        executable_path: Path to the executable file
        
    Returns:
        str or bool: Path to the installer if successful, False otherwise
    """
    if platform.system() != 'Darwin':
        logger.warning("macOS installer can only be created on macOS")
        return False
    
    # Get project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    
    # Check if executable exists
    if not os.path.exists(executable_path):
        logger.error(f"Executable not found: {executable_path}")
        return False
    
    # Create a temporary directory for the .app bundle
    app_dir = os.path.join(project_dir, 'dist', 'JobFit.app')
    app_contents_dir = os.path.join(app_dir, 'Contents')
    app_macos_dir = os.path.join(app_contents_dir, 'MacOS')
    app_resources_dir = os.path.join(app_contents_dir, 'Resources')
    
    # Create the directory structure
    os.makedirs(app_macos_dir, exist_ok=True)
    os.makedirs(app_resources_dir, exist_ok=True)
    
    # Copy the executable to the .app bundle
    shutil.copy2(executable_path, os.path.join(app_macos_dir, 'JobFit'))
    
    # Create the Info.plist file
    info_plist = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>JobFit</string>
    <key>CFBundleIconFile</key>
    <string>AppIcon</string>
    <key>CFBundleIdentifier</key>
    <string>com.hassanshahzad.jobfit</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>JobFit</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.14</string>
    <key>NSHighResolutionCapable</key>
    <true/>
    <key>NSHumanReadableCopyright</key>
    <string>Copyright © 2025 Hassan Shahzad. All rights reserved.</string>
    <key>NSMainNibFile</key>
    <string>MainMenu</string>
    <key>NSPrincipalClass</key>
    <string>NSApplication</string>
</dict>
</plist>
"""
    with open(os.path.join(app_contents_dir, 'Info.plist'), 'w') as f:
        f.write(info_plist)
    
    # Copy icon if it exists
    icon_path = os.path.join(project_dir, 'frontend', 'public', 'favicon.ico')
    if os.path.exists(icon_path):
        try:
            # Convert ico to icns if possible
            logger.info("Converting icon to icns format...")
            from PIL import Image
            img = Image.open(icon_path)
            img.save(os.path.join(app_resources_dir, 'AppIcon.icns'))
        except Exception as e:
            logger.warning(f"Could not convert icon to icns: {e}")
    
    # Create DMG file using hdiutil
    dmg_path = os.path.join(project_dir, 'dist', 'JobFit.dmg')
    
    logger.info("Creating DMG file...")
    try:
        subprocess.run(['hdiutil', 'create',
                      '-volname', 'JobFit',
                      '-srcfolder', app_dir,
                      '-ov',
                      '-format', 'UDZO',
                      dmg_path],
                     check=True,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error creating DMG: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    
    # Check if DMG was created
    if not os.path.exists(dmg_path):
        logger.error(f"DMG not found at: {dmg_path}")
        return False
    
    logger.info(f"macOS installer created successfully at: {dmg_path}")
    return dmg_path

def create_linux_installer(executable_path):
    """
    Create a Linux installer.
    
    Args:
        executable_path: Path to the executable file
        
    Returns:
        str or bool: Path to the installer if successful, False otherwise
    """
    if platform.system() != 'Linux':
        logger.warning("Linux installer can only be created on Linux")
        return False
    
    # Get project root directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_dir = os.path.dirname(script_dir)
    
    # Check if executable exists
    if not os.path.exists(executable_path):
        logger.error(f"Executable not found: {executable_path}")
        return False
    
    # Create AppImage directory structure
    appdir = os.path.join(project_dir, 'dist', 'JobFit.AppDir')
    appdir_bin = os.path.join(appdir, 'usr', 'bin')
    appdir_desktop = os.path.join(appdir, 'usr', 'share', 'applications')
    appdir_icon = os.path.join(appdir, 'usr', 'share', 'icons', 'hicolor', '256x256', 'apps')
    
    os.makedirs(appdir_bin, exist_ok=True)
    os.makedirs(appdir_desktop, exist_ok=True)
    os.makedirs(appdir_icon, exist_ok=True)
    
    # Copy executable
    shutil.copy2(executable_path, os.path.join(appdir_bin, 'JobFit'))
    
    # Create desktop file
    desktop_entry = """[Desktop Entry]
Name=JobFit
Comment=AI Job Match Analyzer
Exec=JobFit
Icon=jobfit
Type=Application
Categories=Office;Utility;
"""
    with open(os.path.join(appdir_desktop, 'jobfit.desktop'), 'w') as f:
        f.write(desktop_entry)
    
    # Copy icon if it exists
    icon_path = os.path.join(project_dir, 'frontend', 'public', 'favicon.ico')
    if os.path.exists(icon_path):
        try:
            # Convert ico to png if possible
            logger.info("Converting icon to png format...")
            from PIL import Image
            img = Image.open(icon_path)
            img.save(os.path.join(appdir_icon, 'jobfit.png'))
        except Exception as e:
            logger.warning(f"Could not convert icon to png: {e}")
    
    # Create AppRun script
    apprun = """#!/bin/bash
SELF=$(readlink -f "$0")
HERE=${SELF%/*}
export PATH="${HERE}/usr/bin:${PATH}"
export LD_LIBRARY_PATH="${HERE}/usr/lib:${LD_LIBRARY_PATH}"
exec "${HERE}/usr/bin/JobFit" "$@"
"""
    with open(os.path.join(appdir, 'AppRun'), 'w') as f:
        f.write(apprun)
    
    # Make AppRun executable
    os.chmod(os.path.join(appdir, 'AppRun'), 0o755)
    
    # Create symlinks
    os.symlink('usr/share/icons/hicolor/256x256/apps/jobfit.png', os.path.join(appdir, 'jobfit.png'))
    os.symlink('usr/share/applications/jobfit.desktop', os.path.join(appdir, 'jobfit.desktop'))
    
    # Check if appimagetool is installed
    appimagetool = shutil.which('appimagetool')
    if not appimagetool:
        logger.error("appimagetool not found. Please install it and add it to PATH.")
        return False
    
    # Create AppImage
    logger.info("Creating AppImage...")
    try:
        subprocess.run(['appimagetool', appdir],
                     cwd=os.path.join(project_dir, 'dist'),
                     check=True,
                     stdout=subprocess.PIPE,
                     stderr=subprocess.PIPE,
                     universal_newlines=True)
    except subprocess.CalledProcessError as e:
        logger.error(f"Error creating AppImage: {e}")
        logger.error(f"Output: {e.stdout}")
        logger.error(f"Error: {e.stderr}")
        return False
    
    # Rename the AppImage
    appimage_path = os.path.join(project_dir, 'dist', 'JobFit-x86_64.AppImage')
    if not os.path.exists(appimage_path):
        logger.error(f"AppImage not found at: {appimage_path}")
        return False
    
    # Make the AppImage executable
    os.chmod(appimage_path, 0o755)
    
    logger.info(f"Linux installer created successfully at: {appimage_path}")
    return appimage_path

def create_installer(executable_path):
    """
    Create a platform-specific installer.
    
    Args:
        executable_path: Path to the executable file
        
    Returns:
        str or bool: Path to the installer if successful, False otherwise
    """
    if not executable_path or not os.path.exists(executable_path):
        logger.error(f"Executable not found: {executable_path}")
        return False
    
    # Determine platform
    system = platform.system()
    
    if system == 'Windows':
        return create_windows_installer(executable_path)
    elif system == 'Darwin':
        return create_macos_installer(executable_path)
    elif system == 'Linux':
        return create_linux_installer(executable_path)
    else:
        logger.error(f"Unsupported platform: {system}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        logger.error("Usage: python create_installer.py <executable_path>")
        sys.exit(1)
    
    executable_path = sys.argv[1]
    success = create_installer(executable_path)
    if not success:
        sys.exit(1)
    sys.exit(0)