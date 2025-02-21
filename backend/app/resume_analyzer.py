import google.generativeai as genai
import json
from typing import BinaryIO
from PyPDF2 import PdfReader
import io
import re

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
        You are a professional resume analyzer. Analyze this resume content and provide detailed results.

        Resume content to analyze:
        {resume_content}

        Job links to analyze against:
        {job_links_parsed}

        IMPORTANT INSTRUCTIONS:
        1. Always provide at least 3 recommendations, even for high matches, focusing on ways to strengthen the application
        2. For matches above 75%, provide recommendations to excel in the role
        3. Recommendations should be specific and actionable
        4. Match percentage should be based on both technical skills and overall profile fit

        Return ONLY a JSON object with this exact structure:
        {{
            "jobs": [
                {{
                    "job_link": "<job url>",
                    "match_percentage": <number 0-100>,
                    "matching_skills": [<list of matching skills>],
                    "missing_skills": [<list of missing skills>],
                    "recommendations": [
                        "Specific recommendation 1",
                        "Specific recommendation 2",
                        "Specific recommendation 3"
                    ]
                }}
            ]
        }}
        """

        # Generate response
        model = genai.GenerativeModel("gemini-pro")
        model_config = {
            "temperature": 0.7,  # Increased for more creative recommendations
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048
        }
        response = model.generate_content(prompt, generation_config=model_config)

        if not response or not response.text:
            return {
                "success": False,
                "error": "No response from AI model"
            }

        try:
            # Extract and parse JSON
            json_str = re.search(r'({[\s\S]*})', response.text)
            if not json_str:
                return {
                    "success": False,
                    "error": "Invalid response format"
                }

            analysis = json.loads(json_str.group(1))

            # Validate response structure and ensure recommendations
            if not isinstance(analysis, dict) or "jobs" not in analysis:
                return {
                    "success": False,
                    "error": "Invalid response structure"
                }

            # Ensure each job has recommendations
            for job in analysis["jobs"]:
                if not job.get("recommendations"):
                    job["recommendations"] = [
                        "Highlight relevant project achievements",
                        "Quantify your impact with metrics",
                        "Add specific examples of team leadership"
                    ]

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