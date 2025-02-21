"""
Flask application factory and configuration module.
This module initializes the Flask application with necessary configurations.
"""

import os
from importlib import import_module

import google.generativeai as genai
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS


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
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    genai.configure(api_key=api_key)

    # Import and register blueprints
    # Using import_module to avoid circular imports
    routes = import_module(".routes", package="app")
    app.register_blueprint(routes.api_bp)

    return app
