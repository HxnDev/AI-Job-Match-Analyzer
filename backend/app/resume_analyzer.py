"""
Resume analysis module for processing and analyzing resumes against job descriptions.
This module handles PDF parsing, text extraction, and AI-based analysis.
"""

import gc
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

# Maximum content length for job descriptions to prevent token limits
MAX_JOB_DESCRIPTION_LENGTH = 1500
MAX_RESUME_CONTENT_LENGTH = 5000


def extract_text_from_pdf(file_bytes: BinaryIO) -> str:
    """
    Extract text content from a PDF file with memory optimization.

    Args:
        file_bytes: File object containing the PDF data

    Returns:
        str: Extracted text from the PDF

    Raises:
        ValueError: If there's an error reading the PDF
    """
    try:
        # Create a BytesIO buffer for efficient memory usage
        pdf_buffer = io.BytesIO(file_bytes.read())
        file_bytes.seek(0)

        # Use context manager for better resource management
        text = ""

        # Open PDF reader with the buffer
        pdf = PdfReader(pdf_buffer)

        # Process pages one by one to reduce memory usage
        for page in pdf.pages:
            # Extract text from the page and append to result
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        # Close the buffer explicitly
        pdf_buffer.close()

        # Force garbage collection to free up memory
        gc.collect()

        # Truncate very long resume content to prevent token limits
        if len(text) > MAX_RESUME_CONTENT_LENGTH:
            logger.info(f"Truncating resume content from {len(text)} to {MAX_RESUME_CONTENT_LENGTH} chars")
            text = text[:MAX_RESUME_CONTENT_LENGTH] + "..."

        return text

    except Exception as e:
        logger.error(f"Error reading PDF: {str(e)}", exc_info=True)
        # Clean up resources on error
        gc.collect()
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
                # Truncate very long resume content
                if len(resume_content) > MAX_RESUME_CONTENT_LENGTH:
                    logger.info(f"Truncating resume content from {len(resume_content)} to {MAX_RESUME_CONTENT_LENGTH} chars")
                    resume_content = resume_content[:MAX_RESUME_CONTENT_LENGTH] + "..."
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

        # Clean up memory
        del resume_content
        gc.collect()

        if ats_result and ats_result["success"]:
            return {"success": True, "results": analysis_result["jobs"], "ats_analysis": ats_result["analysis"]}
        else:
            return {"success": True, "results": analysis_result["jobs"]}

    except Exception as e:
        logger.error(f"Error in analyze_resume: {str(e)}", exc_info=True)
        # Clean up memory on error
        gc.collect()
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

    # Format job details for the AI - with truncated job links and descriptions
    jobs_text = []
    for i, job in enumerate(job_details):
        # Create a copy of the job dictionary to avoid modifying the original
        job_copy = job.copy()

        # Store the original job link for later use but don't send to AI
        if "job_link" in job_copy and job_copy["job_link"]:
            # Store only a truncated version of the link or domain for reference
            original_link = job_copy["job_link"]
            try:
                # Extract domain only if it's a URL
                if original_link.startswith(("http://", "https://")):
                    # Try to extract just the domain
                    match = re.search(r"https?://([^/]+)", original_link)
                    if match:
                        domain = match.group(1)
                        job_copy["job_link"] = f"Link from {domain}"
                    else:
                        # If domain extraction fails, just truncate
                        job_copy["job_link"] = original_link[:50] + "..." if len(original_link) > 50 else original_link
                else:
                    # If it's not a URL, just truncate
                    job_copy["job_link"] = original_link[:50] + "..." if len(original_link) > 50 else original_link
            except Exception as e:
                # If any error occurs, just truncate
                logger.warning(f"Error processing job link: {str(e)}")
                job_copy["job_link"] = original_link[:50] + "..." if len(original_link) > 50 else original_link

        job_text = f"Job #{i+1}:\n"
        job_text += f"Title: {job_copy.get('job_title', 'Unknown Position')}\n"
        job_text += f"Company: {job_copy.get('company_name', 'Unknown Company')}\n"

        if job_copy.get("job_description"):
            # Truncate job description if it's very long
            job_desc = job_copy.get("job_description")
            if len(job_desc) > MAX_JOB_DESCRIPTION_LENGTH:
                logger.info(f"Truncating job description for job #{i+1} from {len(job_desc)} to {MAX_JOB_DESCRIPTION_LENGTH} chars")
                job_text += f"Description: {job_desc[:MAX_JOB_DESCRIPTION_LENGTH]}...\n"
            else:
                job_text += f"Description: {job_desc}\n"

        # We've already handled the job link above, but we'll add a reference without the full URL
        if job_copy.get("job_link"):
            job_text += f"URL: {job_copy.get('job_link')}\n"

        jobs_text.append(job_text)

    # Join all job details
    all_jobs_text = "\n\n".join(jobs_text)

    # Truncate resume content for prompt if needed again
    if len(resume_content) > MAX_RESUME_CONTENT_LENGTH:
        prompt_resume = resume_content[:MAX_RESUME_CONTENT_LENGTH] + "..."
    else:
        prompt_resume = resume_content

    base_prompt = f"""
    You are a professional resume analyzer. Analyze this resume content against the job details provided.

    Resume content to analyze:
    {prompt_resume}

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

        # Restore original job links where available
        for i, job_result in enumerate(analysis["jobs"]):
            if i < len(job_details) and "job_link" in job_details[i]:
                job_result["job_link"] = job_details[i]["job_link"]

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

        # Clean up memory before returning
        del prompt
        del response
        gc.collect()

        return {"success": True, "jobs": analysis["jobs"]}

    except Exception as e:
        logger.error(f"Error in generate_analysis: {str(e)}", exc_info=True)
        # Clean up memory on error
        gc.collect()
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
        # Truncate resume content for the prompt if it's too long
        if len(resume_content) > MAX_RESUME_CONTENT_LENGTH:
            logger.info(f"Truncating resume content for review from {len(resume_content)} to {MAX_RESUME_CONTENT_LENGTH} chars")
            prompt_resume = resume_content[:MAX_RESUME_CONTENT_LENGTH] + "..."
        else:
            prompt_resume = resume_content

        # Truncate job description if it's very long
        if len(job_description) > MAX_JOB_DESCRIPTION_LENGTH:
            logger.info(f"Truncating job description for review from {len(job_description)} to {MAX_JOB_DESCRIPTION_LENGTH} chars")
            prompt_job = job_description[:MAX_JOB_DESCRIPTION_LENGTH] + "..."
        else:
            prompt_job = job_description

        base_prompt = f"""
        You are a professional resume reviewer and career coach. Review this resume against the job description
        and provide detailed, actionable feedback to help improve the resume.

        Resume content:
        {prompt_resume}

        Job description:
        {prompt_job}

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

                # Clean up memory
                del prompt
                del response
                gc.collect()

                return {"success": True, "review": review_data}

            except json.JSONDecodeError as e:
                # Clean up memory on error
                gc.collect()

                return {
                    "success": False,
                    "error": f"Invalid response format from AI model: {str(e)}",
                    "raw_response": cleaned_text[:500],  # Include part of the raw response for debugging
                }
        else:
            return {"success": False, "error": "Failed to generate resume review"}

    except Exception as e:
        # Clean up memory on error
        gc.collect()
        return {"success": False, "error": f"Error generating resume review: {str(e)}"}
