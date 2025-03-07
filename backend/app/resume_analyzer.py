"""
Resume analysis module for processing and analyzing resumes against job descriptions.
This module handles PDF parsing, text extraction, and AI-based analysis.
"""

import io
import json
import logging
import re
from typing import BinaryIO, Dict, Union, List, Any

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


def analyze_resume(resume: BinaryIO, job_links: str, custom_instructions: str = "") -> Dict[str, Union[bool, list, str]]:
    """
    Analyze a resume against job descriptions using AI.

    Args:
        resume: File object containing the resume
        job_links: JSON string containing job links
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

        # UPDATED: Ensure job_links is properly handled regardless of type
        # This is a defensive check to handle different possible input types
        if isinstance(job_links, str):
            try:
                # Try to parse it as JSON if it's a string
                job_links_parsed = json.loads(job_links)
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing job links as JSON: {str(e)}")
                return {"success": False, "error": f"Invalid job links format: {str(e)}"}
        else:
            # Use as is if it's already a list or other type
            job_links_parsed = job_links

        # Ensure it's a list
        if not isinstance(job_links_parsed, list):
            job_links_parsed = [job_links_parsed] if job_links_parsed else []

        # Log for debugging
        logger.info(f"Processing {len(job_links_parsed)} job links")

        # Generate AI analysis
        analysis_result = generate_analysis(resume_content, job_links_parsed, custom_instructions)

        if not analysis_result["success"]:
            return analysis_result
            
        # Add ATS compatibility check
        ats_result = analyze_ats_compatibility(resume_content)
        
        if ats_result["success"]:
            return {
                "success": True, 
                "results": analysis_result["jobs"],
                "ats_analysis": ats_result["analysis"]
            }
        else:
            return {"success": True, "results": analysis_result["jobs"]}

    except Exception as e:
        logger.error(f"Error in analyze_resume: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error analyzing resume: {str(e)}"}
    

def generate_analysis(resume_content: str, job_links: List[str], custom_instructions: str = "") -> Dict[str, Union[bool, list, str]]:
    """
    Generate AI analysis for the resume and job links.

    Args:
        resume_content: Text content of the resume
        job_links: List of job links to analyze against
        custom_instructions: Optional custom instructions for the review

    Returns:
        dict: Analysis results from the AI model
    """
    # UPDATED: Ensure job_links is properly handled as a list
    if not isinstance(job_links, list):
        try:
            # Try to convert to list if it's a string or other type
            if job_links:
                job_links = [job_links] if not isinstance(job_links, list) else job_links
            else:
                job_links = []
        except Exception as e:
            logger.error(f"Error converting job_links to list: {str(e)}")
            job_links = []
    
    # NEW: Truncate long URLs to prevent JSON parsing issues in AI response
    truncated_job_links = []
    for link in job_links:
        # Extract domain and basic path, limit URL to 100 characters
        try:
            from urllib.parse import urlparse
            parsed_url = urlparse(str(link))
            domain = parsed_url.netloc
            path = parsed_url.path[:30] if parsed_url.path else ""
            
            # Create a simplified URL
            simplified_url = f"{parsed_url.scheme}://{domain}{path}..."
            truncated_job_links.append(simplified_url)
            logger.info(f"Truncated URL: {simplified_url}")
        except Exception as e:
            # If parsing fails, use a very simplified version
            logger.error(f"Error truncating URL: {str(e)}")
            truncated_job_links.append(str(link)[:80] + "...")
    
    # Format job links for better AI understanding using truncated links
    job_links_text = "\n".join([link for link in truncated_job_links if link])
    
    # Log for debugging
    logger.info(f"Analyzing resume against {len(job_links)} job links (truncated)")
    
    base_prompt = f"""
    You are a professional resume analyzer. Analyze this resume content against the job links provided.

    Resume content to analyze:
    {resume_content}

    Job links to analyze against (these are shortened for brevity):
    {job_links_text}

    IMPORTANT INSTRUCTIONS:
    1. Imagine you can access each job posting and understand its requirements.
    2. For each job link, analyze what skills and qualifications would be required.
    3. Compare these requirements against the resume content.
    4. Provide a match percentage based on how well the resume matches the expected job requirements.
    5. Identify matching skills present in the resume.
    6. Identify skills that might be missing or need improvement.
    7. Provide at least 3 specific, actionable recommendations for each job.
    8. For matches above 75%, focus on how to excel in the role rather than just qualify.
    9. Recommendations should be tailored to the specific job and company.
    10. The job links are shortened - focus on creating realistic analysis without using the full URLs.

    Return ONLY a JSON object with this exact structure:
    {{
        "jobs": [
            {{
                "job_title": "<appropriate job title based on the URL domain>",
                "company_name": "<appropriate company name based on the URL domain>",
                "job_link": "<shortened job url>",
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

        # UPDATED: More robust JSON extraction with improved error handling
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
            
            # NEW: Try a more aggressive cleanup of the JSON
            try:
                if json_str:
                    # Try to fix common JSON issues
                    fixed_json = json_str.group(1)
                    
                    # Replace any truncated URLs with placeholder
                    fixed_json = re.sub(r'"job_link": "[^"]{100,}', '"job_link": "https://job.url/..."', fixed_json)
                    
                    # Try parsing again with fixed JSON
                    analysis = json.loads(fixed_json)
                    logger.info("Successfully parsed JSON after cleanup")
                else:
                    return {"success": False, "error": f"Error parsing AI response: {str(e)}"}
            except Exception as inner_e:
                logger.error(f"Failed to fix JSON: {str(inner_e)}")
                return {"success": False, "error": f"Error parsing AI response: {str(e)}"}

        # Validate response structure
        if not isinstance(analysis, dict) or "jobs" not in analysis:
            logger.error(f"Invalid response structure: {analysis}")
            return {"success": False, "error": "Invalid response structure: 'jobs' field missing"}

        # UPDATED: Map truncated URLs back to original URLs
        original_urls_map = {truncated_job_links[i]: job_links[i] for i in range(min(len(truncated_job_links), len(job_links)))}
        
        # Ensure recommendations and required fields
        for job in analysis["jobs"]:
            # Replace truncated URL with original if available
            if job.get("job_link") in original_urls_map:
                job["job_link"] = original_urls_map[job["job_link"]]
            elif job.get("job_link") and any(link in job["job_link"] for link in ["indeed", "linkedin", "glassdoor"]):
                # Try to find closest matching original URL based on domain
                for truncated, original in original_urls_map.items():
                    if truncated.split("://")[1].split(".")[0] in job["job_link"]:
                        job["job_link"] = original
                        break
            
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