"""
Resume analysis module for processing and analyzing resumes against job descriptions.
This module handles PDF parsing, text extraction, and AI-based analysis.
"""

import io
import json
import logging
import re
from typing import BinaryIO, Dict, List, Union

import google.generativeai as genai
from PyPDF2 import PdfReader

from .ats_analyzer import analyze_ats_compatibility


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


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


def analyze_resume(resume: BinaryIO, job_details: List[Dict], custom_instructions: str = "") -> Dict[str, Union[bool, list, str]]:
    """
    Analyze a resume against job descriptions using AI.

    Args:
        resume: File object containing the resume
        job_details: List of dictionaries containing job details (title, company, description)
        custom_instructions: Optional custom instructions for the review

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

        # Validate job details
        if not isinstance(job_details, list):
            # Convert to list if it's not already
            job_details = [job_details] if job_details else []

        # Log for debugging
        logger.info(f"Processing {len(job_details)} job entries")

        # Generate AI analysis
        analysis_result = generate_analysis(resume_content, job_details, custom_instructions)

        if not analysis_result["success"]:
            return analysis_result

        # Add ATS compatibility check using the first job description if available
        ats_result = None
        if job_details and "job_description" in job_details[0] and job_details[0]["job_description"]:
            ats_result = analyze_ats_compatibility(resume_content)

        if ats_result and ats_result["success"]:
            return {"success": True, "results": analysis_result["jobs"], "ats_analysis": ats_result["analysis"]}
        else:
            return {"success": True, "results": analysis_result["jobs"]}

    except Exception as e:
        logger.error(f"Error in analyze_resume: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error analyzing resume: {str(e)}"}


def generate_analysis(resume_content: str, job_details: List[Dict], custom_instructions: str = "") -> Dict[str, Union[bool, list, str]]:
    """
    Generate AI analysis for the resume and job details.

    Args:
        resume_content: Text content of the resume
        job_details: List of dictionaries containing job information
        custom_instructions: Optional custom instructions for the review

    Returns:
        dict: Analysis results from the AI model
    """
    # Log for debugging
    logger.info(f"Analyzing resume against {len(job_details)} job entries")

    # Format job details for the AI
    jobs_text = []
    for i, job in enumerate(job_details):
        job_text = f"Job #{i+1}:\n"
        job_text += f"Title: {job.get('job_title', 'Unknown Position')}\n"
        job_text += f"Company: {job.get('company_name', 'Unknown Company')}\n"

        if job.get("job_description"):
            job_text += f"Description: {job.get('job_description')}\n"

        if job.get("job_link"):
            job_text += f"URL: {job.get('job_link')}\n"

        jobs_text.append(job_text)

    # Join all job details
    all_jobs_text = "\n\n".join(jobs_text)

    base_prompt = f"""
    You are a professional resume analyzer. Analyze this resume content against the job details provided.

    Resume content to analyze:
    {resume_content}

    Job details to analyze against:
    {all_jobs_text}

    IMPORTANT INSTRUCTIONS:
    1. For each job, analyze what skills and qualifications are required based on the job description.
    2. Compare these requirements against the resume content.
    3. Provide a match percentage based on how well the resume matches the job requirements.
    4. Identify matching skills present in the resume that align with the job.
    5. Identify skills mentioned in the job that might be missing or need improvement in the resume.
    6. Provide at least 3 specific, actionable recommendations for each job.
    7. For matches above 75%, focus on how to excel in the role rather than just qualify.
    8. Recommendations should be tailored to the specific job and company.

    Return ONLY a JSON object with this exact structure:
    {{
        "jobs": [
            {{
                "job_title": "<job title from input>",
                "company_name": "<company name from input>",
                "job_link": "<job link from input if available>",
                "match_percentage": <number 0-100>,
                "matching_skills": [<list of matching skills>],
                "missing_skills": [<list of missing skills>],
                "job_description": "<job description from input>",
                "recommendations": [
                    "Specific recommendation 1",
                    "Specific recommendation 2",
                    "Specific recommendation 3"
                ]
            }}
        ]
    }}
    """

    # Add custom instructions if provided
    if custom_instructions and custom_instructions.strip():
        prompt = base_prompt + f"\n\nAdditional customization requirements:\n{custom_instructions}"
    else:
        prompt = base_prompt

    model = genai.GenerativeModel("gemini-2.0-flash")
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

        # Extract and parse JSON with improved error handling
        try:
            # Extract and parse JSON
            json_str = re.search(r"({[\s\S]*})", response.text)
            if not json_str:
                logger.error("Failed to extract JSON from response")
                logger.error(f"Response text: {response.text[:500]}")
                return {"success": False, "error": "Invalid response format: JSON not found"}

            # Print the extracted JSON for debugging
            extracted_json = json_str.group(1)
            logger.info(f"Extracted JSON (first 200 chars): {extracted_json[:200]}...")

            analysis = json.loads(extracted_json)

            # Log successful parsing
            logger.info("Successfully parsed AI response as JSON")

        except json.JSONDecodeError as e:
            # Provide detailed error information for debugging
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Extracted text: {json_str.group(1)[:500] if json_str else 'No JSON found'}")
            return {"success": False, "error": f"Error parsing AI response: {str(e)}"}

        # Validate response structure
        if not isinstance(analysis, dict) or "jobs" not in analysis:
            logger.error(f"Invalid response structure: {analysis}")
            return {"success": False, "error": "Invalid response structure: 'jobs' field missing"}

        # Ensure recommendations and required fields
        for job in analysis["jobs"]:
            # Make sure we have recommendations
            if not job.get("recommendations"):
                job["recommendations"] = [
                    "Highlight relevant project achievements",
                    "Quantify your impact with metrics",
                    "Add specific examples of team leadership",
                ]

            # Ensure all fields exist
            if not job.get("job_title"):
                job["job_title"] = "Position"
            if not job.get("company_name"):
                job["company_name"] = "Company"
            if not job.get("matching_skills"):
                job["matching_skills"] = []
            if not job.get("missing_skills"):
                job["missing_skills"] = []
            if not job.get("match_percentage"):
                job["match_percentage"] = 50

        return {"success": True, "jobs": analysis["jobs"]}

    except Exception as e:
        logger.error(f"Error in generate_analysis: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error generating analysis: {str(e)}"}


def generate_resume_review(resume_content: str, job_description: str, custom_instructions: str = "") -> dict:
    """
    Generate detailed resume review and improvement suggestions.

    Args:
        resume_content: Text content of the resume
        job_description: Text content of the job description
        custom_instructions: Optional custom instructions for the review

    Returns:
        dict: Review results including strengths, weaknesses, and improvement suggestions
    """
    try:
        base_prompt = f"""
        You are a professional resume reviewer and career coach. Review this resume against the job description
        and provide detailed, actionable feedback to help improve the resume.

        Resume content:
        {resume_content}

        Job description:
        {job_description}

        IMPORTANT: Your response must be a valid JSON object with the exact structure shown below.
        Do not include any explanations, markdown, or text outside of the JSON object.

        JSON structure to use:
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

        # Add custom instructions if provided
        if custom_instructions and custom_instructions.strip():
            prompt = base_prompt + f"\n\nAdditional customization requirements:\n{custom_instructions}"
        else:
            prompt = base_prompt

        model = genai.GenerativeModel("gemini-2.0-flash")
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
            # Try to parse the response as JSON with more robust error handling
            try:
                # Clean up the response text to ensure it's valid JSON
                cleaned_text = response.text.strip()

                # Find JSON content using regex if needed
                json_match = re.search(r"({[\s\S]*})", cleaned_text)
                if json_match:
                    cleaned_text = json_match.group(1)

                # Parse the JSON
                review_data = json.loads(cleaned_text)

                # Validate the structure
                if not isinstance(review_data, dict):
                    return {"success": False, "error": "Response is not a valid JSON object"}

                if "strengths" not in review_data or "weaknesses" not in review_data or "improvement_suggestions" not in review_data:
                    return {"success": False, "error": "Response is missing required fields"}

                # Ensure all sections are present with default values if needed
                if not review_data.get("strengths"):
                    review_data["strengths"] = ["Strong professional experience", "Clear presentation of skills", "Good organization"]

                if not review_data.get("weaknesses"):
                    review_data["weaknesses"] = ["Could benefit from more quantifiable achievements", "Consider adding more relevant keywords", "Format could be more scannable"]

                sections = ["Format", "Content", "Skills", "Experience", "Keywords"]
                existing_sections = [s["section"] for s in review_data.get("improvement_suggestions", [])]

                for section in sections:
                    if section not in existing_sections:
                        review_data.setdefault("improvement_suggestions", []).append({"section": section, "suggestions": ["Consider reviewing this section"]})

                return {"success": True, "review": review_data}

            except json.JSONDecodeError as e:
                return {
                    "success": False,
                    "error": f"Invalid response format from AI model: {str(e)}",
                    "raw_response": cleaned_text[:500],  # Include part of the raw response for debugging
                }
        else:
            return {"success": False, "error": "Failed to generate resume review"}

    except Exception as e:
        return {"success": False, "error": f"Error generating resume review: {str(e)}"}
