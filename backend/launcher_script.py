#!/usr/bin/env python3
import os
import sys
import webbrowser
import threading
import time
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

# Add the current directory to Python path to ensure app can be imported
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import app modules
import app
from app import create_app
from app.api_key_setup import get_api_key, setup_api_key

# Create Flask app
flask_app = create_app()

def open_browser():
    """Open the web browser after a short delay"""
    # Wait for the server to start
    time.sleep(1.5)
    
    # Open browser
    url = f"http://localhost:5050"
    logger.info(f"Opening browser at {url}")
    webbrowser.open(url)

if __name__ == "__main__":
    # Set default port
    port = int(os.getenv("PORT", "5050"))
    
    # When running as a packaged app, check for API key
    is_frozen = getattr(sys, 'frozen', False)
    if is_frozen:
        # Check if API key is already configured
        api_key = get_api_key()
        
        # If no API key, prompt for it
        if not api_key:
            logger.info("No API key found. Prompting for setup...")
            setup_api_key()
    
        # Open browser automatically when running as packaged app
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Log startup message
        logger.info(f"JobFit is running at http://localhost:{port}")
        logger.info("You can access the application in your web browser")
        logger.info("Press Ctrl+C to quit")
    
    # Run the Flask app
    flask_app.run(debug=False, host="127.0.0.1", port=port, threaded=True)
