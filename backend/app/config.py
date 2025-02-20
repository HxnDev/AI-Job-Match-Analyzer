import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

#OpenAI API key
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not OPENAI_API_KEY:
    raise ValueError("Missing OPENAI_API_KEY in .env file")