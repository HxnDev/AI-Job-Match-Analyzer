"""
Entry point module for the Flask application.
This module initializes and runs the Flask server.
"""

import os

from . import create_app


app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", "5050"))  # Fixed envvar type issue
    app.run(debug=True, port=port)
