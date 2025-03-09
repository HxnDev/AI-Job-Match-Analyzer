#!/usr/bin/env python3
"""
JobFit Launcher Script
This script serves as the main entry point for the packaged JobFit application.
It handles startup, API key verification, and launches the Flask backend.
"""

import os
import sys
import time
import subprocess
import platform
import webbrowser
import tkinter as tk
from tkinter import messagebox
import threading
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

def check_api_key():
    """
    Check if the Gemini API key is configured.
    Returns True if found, False otherwise.
    """
    config_dir = os.path.join(os.path.expanduser("~"), ".jobfit")
    config_file = os.path.join(config_dir, "config.json")
    
    # Check if config file exists
    if os.path.exists(config_file):
        try:
            import json
            with open(config_file, 'r') as f:
                config = json.load(f)
                if 'gemini_api_key' in config and config['gemini_api_key']:
                    return True
        except Exception as e:
            logger.error(f"Error reading config file: {str(e)}")
    
    return False

def open_browser(port):
    """Open web browser to the application URL"""
    # Give the server a moment to start
    time.sleep(2)
    
    url = f"http://localhost:{port}"
    logger.info(f"Opening browser at {url}")
    
    try:
        webbrowser.open(url)
    except Exception as e:
        logger.error(f"Error opening browser: {str(e)}")

def show_splash_screen():
    """Show a splash screen while app is starting"""
    root = tk.Tk()
    root.title("JobFit")
    
    # Center the window
    window_width = 400
    window_height = 200
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    x = (screen_width - window_width) // 2
    y = (screen_height - window_height) // 2
    root.geometry(f"{window_width}x{window_height}+{x}+{y}")
    
    # Set window properties
    root.resizable(False, False)
    root.attributes('-topmost', True)
    
    # Add content
    tk.Label(root, text="JobFit", font=("Arial", 24, "bold")).pack(pady=(20, 10))
    tk.Label(root, text="AI Job Match Analyzer", font=("Arial", 14)).pack()
    tk.Label(root, text="Starting application...", font=("Arial", 10)).pack(pady=(20, 0))
    
    # Add activity indicator
    canvas = tk.Canvas(root, width=40, height=40, bg=root.cget('bg'), highlightthickness=0)
    canvas.pack(pady=10)
    
    def animate_spinner(angle):
        canvas.delete("spinner")
        canvas.create_arc(5, 5, 35, 35, start=angle, extent=60, 
                         tags="spinner", outline="blue", width=4, style=tk.ARC)
        canvas.create_arc(5, 5, 35, 35, start=angle+180, extent=60, 
                         tags="spinner", outline="blue", width=4, style=tk.ARC)
        root.after(50, animate_spinner, (angle + 10) % 360)
    
    animate_spinner(0)
    
    # Function to close splash screen
    def close_splash():
        root.destroy()
    
    # Schedule closing after 5 seconds
    root.after(5000, close_splash)
    
    # Start the Tkinter event loop
    root.mainloop()

def main():
    """Main entry point for the launcher"""
    logger.info("Starting JobFit launcher")
    
    # Show splash screen in a separate thread
    splash_thread = threading.Thread(target=show_splash_screen)
    splash_thread.daemon = True
    splash_thread.start()
    
    # If no API key, run the setup
    if not check_api_key():
        logger.info("No API key found, running setup...")
        # Import here to avoid circular dependencies
        from backend.app.api_key_setup import setup_api_key
        api_key = setup_api_key()
        
        if not api_key:
            # If user canceled setup, show a message and exit
            root = tk.Tk()
            root.withdraw()
            messagebox.showwarning(
                "Setup Incomplete", 
                "JobFit requires a Gemini API key to function. Please restart the application to set up."
            )
            sys.exit(1)
    
    # Determine the path to the backend executable
    if getattr(sys, 'frozen', False):
        # Running as packaged app
        base_dir = os.path.dirname(sys.executable)
        backend_path = os.path.join(base_dir, 'backend_server')
        if platform.system() == 'Windows':
            backend_path += '.exe'
    else:
        # Running in development mode
        base_dir = os.path.dirname(os.path.abspath(__file__))
        backend_path = os.path.join(base_dir, 'backend', 'app', 'main.py')
    
    logger.info(f"Backend path: {backend_path}")
    
    # Set port for the application
    port = 5000
    
    # Start the browser in a separate thread
    browser_thread = threading.Thread(target=open_browser, args=(port,))
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start the backend
    try:
        logger.info("Starting backend server...")
        
        if getattr(sys, 'frozen', False):
            # If packaged, run the backend executable
            if platform.system() == 'Windows':
                # Windows uses subprocess.CREATE_NO_WINDOW to avoid console window
                subprocess.run([backend_path], creationflags=subprocess.CREATE_NO_WINDOW)
            else:
                # macOS/Linux
                subprocess.run([backend_path])
        else:
            # In development, run the Python script
            subprocess.run([sys.executable, backend_path])
    except Exception as e:
        # If backend fails to start, show error
        logger.error(f"Error starting backend: {str(e)}")
        root = tk.Tk()
        root.withdraw()
        messagebox.showerror("Error", f"Failed to start JobFit: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()