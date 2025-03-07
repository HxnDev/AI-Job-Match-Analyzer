"""
ATS compatibility analysis module.
This module evaluates resume compatibility with Applicant Tracking Systems.
"""

import json
import logging
import re
from typing import Any, Dict

import google.generativeai as genai


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def analyze_ats_compatibility(resume_content: str) -> Dict[str, Any]:
    """
    Analyze resume for ATS compatibility and provide a score and recommendations.

    Args:
        resume_content: Text content of the resume

    Returns:
        dict: ATS compatibility analysis including score and recommendations
    """
    try:
        prompt = f"""
        You are an Applicant Tracking System (ATS) expert. Analyze this resume for ATS compatibility.
        
        Resume content:
        {resume_content}
        
        Evaluate this resume for ATS compatibility. Consider the following factors:
        1. Format (is it simple and clean for ATS parsing?)
        2. Use of tables, columns, graphics that might confuse ATS
        3. Use of standard section headings
        4. Keyword optimization
        5. File format compatibility
        6. Font and formatting choices
        7. Use of special characters or bullet points that might cause issues
        8. Header/footer placement
        
        Return ONLY a JSON object with this exact structure:
        {{
            "ats_score": <number 0-100>,
            "summary": "<short summary of ATS compatibility>",
            "format_issues": [
                "<issue 1>",
                "<issue 2>"
            ],
            "content_issues": [
                "<issue 1>",
                "<issue 2>"
            ],
            "keyword_issues": [
                "<issue 1>",
                "<issue 2>"
            ],
            "improvement_suggestions": [
                "<suggestion 1>",
                "<suggestion 2>",
                "<suggestion 3>"
            ],
            "good_practices": [
                "<good practice 1>",
                "<good practice 2>"
            ]
        }}
        """

        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        response = model.generate_content(prompt, generation_config=model_config)
        if not response or not response.text:
            return {"success": False, "error": "No response from AI model"}

        # Extract and parse JSON
        json_str = re.search(r"({[\s\S]*})", response.text)
        if not json_str:
            return {"success": False, "error": "Invalid response format"}

        analysis = json.loads(json_str.group(1))

        # Validate and ensure all required fields
        required_fields = ["ats_score", "summary", "format_issues", "content_issues", "keyword_issues", "improvement_suggestions", "good_practices"]

        for field in required_fields:
            if field not in analysis:
                analysis[field] = [] if field in ["format_issues", "content_issues", "keyword_issues", "improvement_suggestions", "good_practices"] else ""

        if "ats_score" not in analysis or not isinstance(analysis["ats_score"], (int, float)):
            analysis["ats_score"] = 70  # Default score if missing

        return {"success": True, "analysis": analysis}

    except Exception as e:
        return {"success": False, "error": f"Error analyzing ATS compatibility: {str(e)}"}


def generate_optimized_resume_sections(resume_content: str, job_description: str) -> Dict[str, Any]:
    """
    Generate ATS-optimized sections for a resume based on the job description.

    Args:
        resume_content: Text content of the resume
        job_description: Text content of the job description

    Returns:
        dict: Optimized resume sections
    """
    try:
        logger.info("Generating ATS-optimized resume sections")

        # Limit job description length to prevent token issues
        if len(job_description) > 2000:
            logger.info(f"Truncating job description from {len(job_description)} to 2000 characters")
            job_description = job_description[:2000] + "..."

        prompt = f"""
        You are an ATS optimization expert. Generate optimized resume sections based on this job description.
        
        Resume content:
        {resume_content}
        
        Job description:
        {job_description}
        
        Analyze the job description and the current resume, then provide ATS-optimized versions of:
        1. Professional Summary
        2. Skills section
        3. Suggested bullet points for most relevant experience
        
        Make sure to:
        - Incorporate relevant keywords from the job description
        - Use industry-standard section headings
        - Balance keyword optimization with readability
        - Focus on quantifiable achievements
        - Only use content that appears in the original resume (don't invent new experiences)
        
        Return ONLY a JSON object with this exact structure:
        {{
            "professional_summary": "An optimized professional summary...",
            "skills_section": ["Skill 1", "Skill 2", "Skill 3"],
            "experience_bullets": ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
            "keyword_analysis": {{
                "job_keywords": ["Keyword 1", "Keyword 2"],
                "missing_keywords": ["Keyword 3", "Keyword 4"]
            }}
        }}
        
        Important: Use proper JSON formatting with double quotes around all strings and property names.
        """

        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        logger.info("Sending request to AI model for optimized resume sections")
        response = model.generate_content(prompt, generation_config=model_config)

        if not response or not response.text:
            logger.error("No response received from AI model")
            return {"success": False, "error": "No response from AI model"}

        # Log response for debugging
        logger.info(f"Received AI response. Length: {len(response.text)}")
        logger.info(f"Response preview: {response.text[:200]}...")

        # Extract and parse JSON with better error handling
        try:
            # Find the JSON content using regex
            json_str = re.search(r"({[\s\S]*})", response.text)
            if not json_str:
                logger.error("No JSON found in response")
                logger.error(f"Full response: {response.text}")
                return {"success": False, "error": "Invalid response format: JSON not found"}

            # Extract the JSON string
            extracted_json = json_str.group(1)

            # Clean up common formatting issues
            # Replace single quotes with double quotes for JSON compliance
            cleaned_json = re.sub(r"'([^']*)':", r'"\1":', extracted_json)
            cleaned_json = re.sub(r": \'([^\']*)\'", r': "\1"', cleaned_json)

            # Fix missing commas in arrays
            cleaned_json = re.sub(r'"\s*\n\s*"', '", "', cleaned_json)

            # Fix trailing commas in arrays and objects
            cleaned_json = re.sub(r",\s*}", "}", cleaned_json)
            cleaned_json = re.sub(r",\s*]", "]", cleaned_json)

            logger.info(f"Cleaned JSON (first 200 chars): {cleaned_json[:200]}...")

            # Parse the JSON
            optimized_sections = json.loads(cleaned_json)
            logger.info("Successfully parsed JSON response")

            # Validate required fields and provide defaults if missing
            required_fields = ["professional_summary", "skills_section", "experience_bullets", "keyword_analysis"]

            for field in required_fields:
                if field not in optimized_sections:
                    if field == "professional_summary":
                        optimized_sections[field] = "Professional with relevant industry experience seeking to leverage skills and knowledge in a new role."
                    elif field == "skills_section":
                        optimized_sections[field] = ["Communication", "Problem Solving", "Teamwork"]
                    elif field == "experience_bullets":
                        optimized_sections[field] = ["Demonstrated success in relevant projects", "Improved processes and efficiency", "Collaborated with cross-functional teams"]
                    elif field == "keyword_analysis":
                        optimized_sections[field] = {"job_keywords": ["Key term 1", "Key term 2"], "missing_keywords": []}

            # Ensure keyword_analysis has proper structure
            if "keyword_analysis" in optimized_sections:
                if not isinstance(optimized_sections["keyword_analysis"], dict):
                    optimized_sections["keyword_analysis"] = {"job_keywords": ["Key term 1", "Key term 2"], "missing_keywords": []}
                else:
                    if "job_keywords" not in optimized_sections["keyword_analysis"]:
                        optimized_sections["keyword_analysis"]["job_keywords"] = ["Key term 1", "Key term 2"]
                    if "missing_keywords" not in optimized_sections["keyword_analysis"]:
                        optimized_sections["keyword_analysis"]["missing_keywords"] = []

            return {"success": True, "optimized_sections": optimized_sections}

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Problematic JSON: {json_str.group(1)[:500] if json_str else 'No JSON found'}")

            # Create a fallback response with default values
            fallback_response = {
                "professional_summary": "Experienced professional with a proven track record in delivering results. Skilled in relevant tools and methodologies with focus on quality and efficiency.",
                "skills_section": ["Communication", "Problem Solving", "Teamwork", "Attention to Detail", "Organization"],
                "experience_bullets": [
                    "Successfully executed projects on time and within budget",
                    "Collaborated with cross-functional teams to achieve business objectives",
                    "Improved processes resulting in increased efficiency",
                ],
                "keyword_analysis": {"job_keywords": ["Communication", "Teamwork", "Leadership"], "missing_keywords": []},
            }

            return {"success": True, "optimized_sections": fallback_response, "note": "The AI response couldn't be parsed correctly. Showing default recommendations instead."}

    except Exception as e:
        logger.error(f"Error generating optimized resume sections: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error generating optimized resume sections: {str(e)}"}
