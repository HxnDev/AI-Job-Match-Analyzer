"""
Flask application factory and configuration module.
This module initializes the Flask application with necessary configurations.
"""

import os
import sys
import json
import logging
from importlib import import_module

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app() -> Flask:
    """
    Create and configure the Flask application.

    Returns:
        Flask: Configured Flask application instance
    """
    # Load environment variables
    load_dotenv()

    # Initialize Flask app
    app = Flask(__name__)
    CORS(app)

    # Configure Gemini AI
    api_key = os.getenv("GEMINI_API_KEY")
    
    # If no API key in environment, check user config
    if not api_key:
        try:
            # Check for API key in user config
            api_key = get_user_api_key()
        except Exception as e:
            logger.error(f"Error retrieving user API key: {str(e)}")
    
    # If still no API key, prompt for it
    if not api_key:
        try:
            # Only prompt for API key if running as a frozen executable or in development
            is_frozen = getattr(sys, 'frozen', False)
            is_dev = os.environ.get('FLASK_ENV') == 'development'
            
            if is_frozen or is_dev:
                from .api_key_setup import setup_api_key
                logger.info("Prompting user for Gemini API key")
                api_key = setup_api_key()
        except Exception as e:
            logger.error(f"Error setting up API key: {str(e)}")
    
    # Check if we finally have an API key
    if not api_key:
        logger.error("No GEMINI_API_KEY found in environment variables or user config")
        # In development, raise error. In production, let the app try to continue
        if os.environ.get('FLASK_ENV') == 'development':
            raise ValueError("GEMINI_API_KEY not found in environment variables")
    else:
        # Configure Gemini AI with the API key
        genai.configure(api_key=api_key)
        logger.info("Gemini AI configured successfully")

    # Register frontend routes (only if it's not a blueprint that could conflict)
    if hasattr(sys, 'frozen') and getattr(sys, 'frozen'):
        from .frontend import register_frontend_routes
        register_frontend_routes(app)

    # Import and register blueprints
    # Using import_module to avoid circular imports
    routes = import_module(".routes", package="app")
    app.register_blueprint(routes.api_bp)
    logger.info("API routes registered")

    return app


def get_user_api_key() -> str:
    """
    Get the Gemini API key from user configuration.
    
    Returns:
        str: API key or None if not found
    """
    # Check for config file in user home directory
    config_file = os.path.join(os.path.expanduser("~"), ".jobfit", "config.json")
    
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
                return config.get('gemini_api_key')
        except Exception as e:
            logger.error(f"Error reading config file: {str(e)}")
    
    return None