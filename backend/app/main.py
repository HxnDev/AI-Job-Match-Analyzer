"""
Entry point module for the Flask application.
This module initializes and runs the Flask server.
"""

import logging
import os

from . import create_app


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)

# Initialize Flask application
app = create_app()

if __name__ == "__main__":
    # Get environment variables
    flask_env = os.getenv("FLASK_ENV", "development")
    port = int(os.getenv("PORT", "5050"))

    # Only enable debug mode in development
    debug_mode = flask_env == "development"

    logger.info(f"Starting JobFit API in {flask_env} mode on port {port}")

    # Run the application
    app.run(
        debug=debug_mode,
        host="0.0.0.0",  # Listen on all interfaces
        port=port,
    )
