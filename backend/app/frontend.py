"""
Frontend serving module.
This module handles serving the static React frontend files from the Flask backend.
"""

import logging
import os
import sys

from flask import send_from_directory


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def register_frontend_routes(app):
    """
    Register routes to serve the frontend static files.

    Args:
        app: Flask application instance
    """
    # Determine the frontend dist path
    # When running as script, frontend is in ../../frontend/dist
    # When running as packaged app, frontend is in frontend/dist
    script_path = os.path.dirname(os.path.abspath(__file__))

    # First try relative to backend (development mode)
    frontend_dist = os.path.join(script_path, "..", "..", "frontend", "dist")

    # If not found, try packaged location (frozen executable)
    if not os.path.exists(frontend_dist):
        # Try packaged location
        if hasattr(sys, "_MEIPASS"):  # PyInstaller sets this
            frontend_dist = os.path.join(sys._MEIPASS, "frontend", "dist")
        else:
            # Try current directory + frontend/dist (common fallback)
            frontend_dist = os.path.join(os.getcwd(), "frontend", "dist")

    logger.info(f"Frontend dist path: {frontend_dist}")

    # Check if frontend dist exists
    if not os.path.exists(frontend_dist):
        logger.warning(f"Frontend dist not found at {frontend_dist}")
        # We'll still register routes, they'll just return 404

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        """Serve frontend static files"""
        # If path is an API route, don't handle it here
        if path.startswith("api/"):
            return None  # Let the API blueprint handle it

        # Check if path exists as a file
        if path and os.path.exists(os.path.join(frontend_dist, path)):
            return send_from_directory(frontend_dist, path)

        # For all other routes, serve index.html
        return send_from_directory(frontend_dist, "index.html")

    logger.info("Frontend routes registered")
