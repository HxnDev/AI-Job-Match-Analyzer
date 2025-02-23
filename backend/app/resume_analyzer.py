"""
Resume analysis module for processing and analyzing resumes against job descriptions.
This module handles PDF parsing, text extraction, and AI-based analysis.
"""

import io
import json
import re
from typing import BinaryIO, Dict, Union

import google.generativeai as genai
from PyPDF2 import PdfReader


def extract_text_from_pdf(file_bytes: BinaryIO) -> str:
    """
    Extract text content from a PDF file.

    Args:
        file_bytes: File object containing the PDF data

    Returns:
        str: Extracted text from the PDF

    Raises:
        ValueError: If there's an error reading the PDF
    """
    try:
        pdf_buffer = io.BytesIO(file_bytes.read())
        file_bytes.seek(0)

        pdf = PdfReader(pdf_buffer)
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Error reading PDF: {str(e)}") from e


def analyze_resume(resume: BinaryIO, job_links: str) -> Dict[str, Union[bool, list, str]]:
    """
    Analyze a resume against job descriptions using AI.

    Args:
        resume: File object containing the resume
        job_links: JSON string containing job links

    Returns:
        dict: Analysis results including matches and recommendations
    """
    try:
        # Read resume content
        filename = resume.filename.lower()
        try:
            if filename.endswith(".pdf"):
                resume_content = extract_text_from_pdf(resume)
            elif filename.endswith(".txt"):
                resume_content = resume.read().decode("utf-8")
            else:
                return {
                    "success": False,
                    "error": "Unsupported file format. Please upload a PDF or TXT file.",
                }
        except ValueError as e:
            return {"success": False, "error": str(e)}

        # Parse job links
        try:
            job_links_parsed = json.loads(job_links)
        except json.JSONDecodeError:
            return {"success": False, "error": "Invalid job links format"}

        # Generate AI analysis
        analysis_result = generate_analysis(resume_content, job_links_parsed)

        if not analysis_result["success"]:
            return analysis_result

        return {"success": True, "results": analysis_result["jobs"]}

    except Exception as e:
        return {"success": False, "error": f"Error analyzing resume: {str(e)}"}


def generate_analysis(resume_content: str, job_links: list) -> Dict[str, Union[bool, list, str]]:
    """
    Generate AI analysis for the resume and job links.

    Args:
        resume_content: Text content of the resume
        job_links: List of job links to analyze against

    Returns:
        dict: Analysis results from the AI model
    """
    prompt = f"""
    You are a professional resume analyzer. Analyze this resume content and provide detailed results.

    Resume content to analyze:
    {resume_content}

    Job links to analyze against:
    {job_links}

    IMPORTANT INSTRUCTIONS:
    1. Always provide at least 3 recommendations, even for high matches
    2. For matches above 75%, provide recommendations to excel in the role
    3. Recommendations should be specific and actionable
    4. Match percentage should be based on both technical skills and overall fit
    5. For each job, provide a clear job title and company name

    Return ONLY a JSON object with this exact structure:
    {{
        "jobs": [
            {{
                "job_title": "<job title>",
                "company_name": "<company name>",
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

    model = genai.GenerativeModel("gemini-pro")
    model_config = {
        "temperature": 0.7,
        "top_p": 0.8,
        "top_k": 40,
        "max_output_tokens": 2048,
    }

    try:
        response = model.generate_content(prompt, generation_config=model_config)
        if not response or not response.text:
            return {"success": False, "error": "No response from AI model"}

        # Extract and parse JSON
        json_str = re.search(r"({[\s\S]*})", response.text)
        if not json_str:
            return {"success": False, "error": "Invalid response format"}

        analysis = json.loads(json_str.group(1))

        # Validate response structure
        if not isinstance(analysis, dict) or "jobs" not in analysis:
            return {"success": False, "error": "Invalid response structure"}

        # Ensure recommendations and required fields
        for job in analysis["jobs"]:
            if not job.get("recommendations"):
                job["recommendations"] = [
                    "Highlight relevant project achievements",
                    "Quantify your impact with metrics",
                    "Add specific examples of team leadership",
                ]
            # Ensure job title and company name are present
            if not job.get("job_title"):
                job["job_title"] = "Position"
            if not job.get("company_name"):
                job["company_name"] = "Company"

        return {"success": True, "jobs": analysis["jobs"]}

    except Exception as e:
        return {"success": False, "error": f"Error generating analysis: {str(e)}"}


def generate_resume_review(resume_content: str, job_description: str) -> dict:
    """
    Generate detailed resume review and improvement suggestions.

    Args:
        resume_content: Text content of the resume
        job_description: Text content of the job description

    Returns:
        dict: Review results including strengths, weaknesses, and improvement suggestions
    """
    try:
        prompt = f"""
        You are a professional resume reviewer and career coach. Review this resume against the job description
        and provide detailed, actionable feedback to help improve the resume.

        Resume content:
        {resume_content}

        Job description:
        {job_description}

        Analyze the resume and provide feedback with the following structure (respond ONLY with the JSON, no markdown formatting or other text):
        {{
            "strengths": [
                "Detailed strength point 1",
                "Detailed strength point 2",
                "Detailed strength point 3"
            ],
            "weaknesses": [
                "Area for improvement 1",
                "Area for improvement 2",
                "Area for improvement 3"
            ],
            "improvement_suggestions": [
                {{
                    "section": "Format",
                    "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
                }},
                {{
                    "section": "Content",
                    "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
                }},
                {{
                    "section": "Skills",
                    "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
                }},
                {{
                    "section": "Experience",
                    "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
                }},
                {{
                    "section": "Keywords",
                    "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
                }}
            ]
        }}
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 2048,
            },
        )

        if response and response.text:
            # Try to parse the response as JSON
            try:
                review_data = json.loads(response.text)
                return {"success": True, "review": review_data}
            except json.JSONDecodeError:
                return {"success": False, "error": "Invalid response format from AI model"}
        else:
            return {"success": False, "error": "Failed to generate resume review"}

    except Exception as e:
        return {"success": False, "error": f"Error generating resume review: {str(e)}"}
