"""
Motivational letter generation module.
This module generates motivational letters for job applications explaining why the candidate
is applying for the position and why they should be hired.
"""

from typing import Any, Dict

import google.generativeai as genai


def generate_motivational_letter(job_details: Dict[str, str]) -> Dict[str, Any]:
    """
    Generate a motivational letter for a job application.

    Args:
        job_details: Dictionary containing job title, company name, and job description

    Returns:
        dict: Contains success status and either the motivational letter or error message
    """
    try:
        # Extract job details
        job_title = job_details.get("job_title", "")
        company_name = job_details.get("company_name", "")
        job_description = job_details.get("job_description", "")

        # Create job context
        job_context = f"Job Title: {job_title}\n"
        if company_name:
            job_context += f"Company Name: {company_name}\n"

        # Add job description if provided
        if job_description and job_description.strip():
            job_context += f"""
            The job description is as follows:
            {job_description}
            
            Use specific details from this job description in the letter.
            """

        # Create prompt for motivational letter generation
        prompt = f"""
        You are a professional career advisor helping a job applicant write a brief motivational letter.
        Create a compelling motivational letter for the following position:
        
        {job_context}

        The motivational letter should:
        1. Explain why the candidate is interested in this position/company
        2. Highlight their relevant skills and qualifications without listing their entire resume
        3. Demonstrate understanding of the role and industry
        4. Express enthusiasm and passion for the field
        5. Explain what makes them a unique fit for this position
        6. Include a professional opening and closing
        7. Be 1-2 paragraphs in length
        8. Have a confident but not arrogant tone

        Focus on explaining motivation and fit rather than detailed work history.
        """

        # Generate motivational letter
        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 1024,
        }
        response = model.generate_content(prompt, generation_config=model_config)

        if response and response.text:
            return {"success": True, "letter": response.text.strip()}
        else:
            return {"success": False, "error": "Failed to generate motivational letter"}

    except Exception as e:
        return {"success": False, "error": f"Error generating motivational letter: {str(e)}"}
