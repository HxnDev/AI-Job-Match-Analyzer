import os
import logging
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

def create_app():
    app = Flask(__name__)
    CORS(app)  # Allow cross-origin requests from the frontend

    # Set up basic logging
    logging.basicConfig(level=logging.INFO)
    app.logger.info("Flask app initialized.")

    # Register blueprints for resume analysis and cover letter generation
    from .resume_analyzer import resume_analyzer_bp
    from .cover_letter import cover_letter_bp

    app.register_blueprint(resume_analyzer_bp, url_prefix='/api')
    app.register_blueprint(cover_letter_bp, url_prefix='/api')

    return app
