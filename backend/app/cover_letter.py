import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Load API Key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_cover_letter(resume_text, job_description):
    prompt = f"""
    Given the following resume:
    {resume_text}

    And this job description:
    {job_description}

    Generate a professional cover letter highlighting key strengths.
    """

    response = genai.GenerativeModel("gemini-pro").generate_content(prompt)
    return response.text if response else "Error generating cover letter"
