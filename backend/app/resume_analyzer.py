import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Load API Key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_resume(resume_text, job_descriptions):
    prompt = f"""
    Given the following resume:
    {resume_text}

    Compare it to these job descriptions:
    {job_descriptions}

    Provide a matching score (0-10) and key strengths/weaknesses.
    """

    response = genai.GenerativeModel("gemini-pro").generate_content(prompt)
    return response.text if response else "Error analyzing resume"
