"""
ATS compatibility analysis module.
This module evaluates resume compatibility with Applicant Tracking Systems.
"""

import json
import re
from typing import Dict, Any, List, Union

import google.generativeai as genai


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
        required_fields = ["ats_score", "summary", "format_issues", "content_issues", 
                          "keyword_issues", "improvement_suggestions", "good_practices"]
        
        for field in required_fields:
            if field not in analysis:
                analysis[field] = [] if field in ["format_issues", "content_issues", 
                                                "keyword_issues", "improvement_suggestions", 
                                                "good_practices"] else ""
        
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
            "professional_summary": "<optimized professional summary>",
            "skills_section": [
                "<skill 1>",
                "<skill 2>"
            ],
            "experience_bullets": [
                "<bullet 1>",
                "<bullet 2>"
            ],
            "keyword_analysis": {
                "job_keywords": [
                    "<keyword 1>", 
                    "<keyword 2>"
                ],
                "missing_keywords": [
                    "<keyword 1>", 
                    "<keyword 2>"
                ]
            }
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

        optimized_sections = json.loads(json_str.group(1))

        return {"success": True, "optimized_sections": optimized_sections}

    except Exception as e:
        return {"success": False, "error": f"Error generating optimized resume sections: {str(e)}"}