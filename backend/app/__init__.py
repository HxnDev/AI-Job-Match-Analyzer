from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

def create_app():
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
    from .routes import api_bp
    app.register_blueprint(api_bp)

    return app