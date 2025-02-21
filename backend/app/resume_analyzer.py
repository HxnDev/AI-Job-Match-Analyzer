import google.generativeai as genai
import json
from typing import BinaryIO
from PyPDF2 import PdfReader
import io
import re

def extract_json_from_response(text: str) -> str:
    """Extract JSON from response text"""
    # Try to find JSON pattern
    json_match = re.search(r'({[\s\S]*})', text)
    if json_match:
        return json_match.group(1)
    return text

def extract_text_from_pdf(file_bytes: BinaryIO) -> str:
    """Extract text from PDF file"""
    try:
        pdf_buffer = io.BytesIO(file_bytes.read())
        file_bytes.seek(0)

        pdf = PdfReader(pdf_buffer)
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

def analyze_resume(resume: BinaryIO, job_links: str) -> dict:
    """Analyze a resume against job descriptions"""
    try:
        # Read resume content
        filename = resume.filename.lower()
        if filename.endswith('.pdf'):
            resume_content = extract_text_from_pdf(resume)
        elif filename.endswith('.txt'):
            resume_content = resume.read().decode('utf-8')
        else:
            return {
                "success": False,
                "error": "Unsupported file format. Please upload a PDF or TXT file."
            }

        # Parse job links
        try:
            job_links_parsed = json.loads(job_links)
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Invalid job links format"
            }

        # Create prompt
        prompt = f"""
        You are a resume analysis assistant. Your task is to respond ONLY with a JSON object, no other text.

        Resume content: {resume_content}
        Job links: {job_links_parsed}

        Return a JSON object with this exact structure, nothing else:
        {{
            "jobs": [
                {{
                    "job_link": <url>,
                    "match_percentage": <number 0-100>,
                    "matching_skills": [<skills found in resume>],
                    "missing_skills": [<required skills not in resume>],
                    "recommendations": [<specific improvements>]
                }}
            ]
        }}
        """

        # Generate response
        model = genai.GenerativeModel("gemini-pro")
        model_config = {
            "temperature": 0.1,  # Lower temperature for more consistent JSON
            "top_p": 0.1,
            "top_k": 1
        }
        response = model.generate_content(prompt, generation_config=model_config)

        if not response or not response.text:
            return {
                "success": False,
                "error": "No response from AI model"
            }

        try:
            # Extract and parse JSON
            json_str = extract_json_from_response(response.text)
            print("Extracted JSON:", json_str)  # Debug print

            analysis = json.loads(json_str)

            # Validate response structure
            if not isinstance(analysis, dict) or "jobs" not in analysis:
                return {
                    "success": False,
                    "error": "Invalid response format from AI model"
                }

            return {
                "success": True,
                "results": analysis["jobs"]
            }

        except json.JSONDecodeError as e:
            print("Failed to parse JSON:", response.text)  # Debug print
            return {
                "success": False,
                "error": f"Error parsing AI response: {str(e)}"
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error analyzing resume: {str(e)}"
        }