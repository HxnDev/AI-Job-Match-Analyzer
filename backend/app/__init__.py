"""
Flask application factory and configuration module.
This module initializes the Flask application with necessary configurations.
"""

import os
from importlib import import_module

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

    # Configure CORS - allow all origins in development and specific origins in production
    is_production = os.getenv("FLASK_ENV") == "production"

    if is_production:
        # In production, allow specific origins
        allowed_origins = [
            "https://hxndev.github.io",  # GitHub Pages domain
            "http://localhost:5173",  # Local dev frontend (for testing)
        ]
        CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)
    else:
        # In development, allow all origins with proper preflight handling
        CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Import and register blueprints
    # Using import_module to avoid circular imports
    routes = import_module(".routes", package="app")
    app.register_blueprint(routes.api_bp)

    return app
