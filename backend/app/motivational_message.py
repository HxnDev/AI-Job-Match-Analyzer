"""
Motivational letter generation module.
This module generates motivational letters for job applications explaining why the candidate
is applying for the position and why they should be hired.
"""

from typing import Dict

import google.generativeai as genai


def generate_motivational_letter(job_title: str, job_description: str = "") -> Dict[str, any]:
    """
    Generate a motivational letter for a job application in the specified language.

    Args:
        job_title: The title of the job the user is applying for
        job_description: Optional job description to make the letter more specific

    Returns:
        dict: Contains success status and either the motivational letter or error message
    """
    try:
        # Add job description if provided
        job_context = ""
        if job_description and job_description.strip():
            job_context = f"""
            The job description is as follows:
            {job_description}
            
            Use specific details from this job description in the letter.
            """

        # Create prompt for motivational letter generation
        prompt = f"""
        You are a professional career advisor helping a job applicant write a brief motivational letter.
        Create a compelling motivational letter for a {job_title} position.
        
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
