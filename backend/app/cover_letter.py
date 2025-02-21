import google.generativeai as genai

def generate_cover_letter(resume_text: str, job_description: str) -> str:
    """
    Generate a cover letter based on resume and job description

    Args:
        resume_text: The text content of the resume
        job_description: The job description text

    Returns:
        str: Generated cover letter or error message
    """
    try:
        prompt = f"""
        Create a professional cover letter based on this resume:
        {resume_text}

        For this job description:
        {job_description}

        The cover letter should:
        1. Be professionally formatted
        2. Highlight relevant experience and skills
        3. Show enthusiasm for the role
        4. Include specific examples from the resume that match the job requirements
        5. Be concise but comprehensive
        """

        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        if response and response.text:
            return response.text
        else:
            return "Error: Unable to generate cover letter"

    except Exception as e:
        return f"Error generating cover letter: {str(e)}"