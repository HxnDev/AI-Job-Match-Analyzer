from typing import Any, Dict

import google.generativeai as genai


def generate_cover_letter(job_details: Dict[str, str], custom_instruction: str = "", language: str = "en") -> Dict[str, Any]:
    """
    Generate a cover letter based on the job details in the specified language

    Args:
        job_details: Dictionary containing job title, company name, and job description
        custom_instruction: Custom instructions for the cover letter
        language: Language code (default: "en" for English)

    Returns:
        dict: Contains success status and either cover letter or error message
    """
    try:
        # Extract job details
        job_title = job_details.get("job_title", "")
        company_name = job_details.get("company_name", "")
        job_description = job_details.get("job_description", "")
        job_link = job_details.get("job_link", "")

        # Determine language instruction
        language_instructions = {
            "en": "Write the cover letter in English.",
            "es": "Escribe la carta de presentación en español (Spanish).",
            "fr": "Écris la lettre de motivation en français (French).",
            "de": "Schreibe das Anschreiben auf Deutsch (German).",
            "zh": "用中文写求职信 (Chinese).",
            "ru": "Напишите сопроводительное письмо на русском языке (Russian).",
            "ar": "اكتب خطاب التغطية باللغة العربية (Arabic).",
        }

        # Default to English if language not supported
        language_instruction = language_instructions.get(language, language_instructions["en"])

        # Create job context
        job_context = f"Job Title: {job_title}\nCompany Name: {company_name}\n"
        if job_description:
            job_context += f"\nJob Description: {job_description}\n"
        if job_link:
            job_context += f"\nJob Posting URL: {job_link}\n"

        # Create prompt for cover letter generation
        base_prompt = f"""
        You are a professional cover letter writer. Create a compelling cover letter for a position.

        Job Details:
        {job_context}

        {language_instruction}

        Write a professional cover letter that:
        1. Has a formal business letter format
        2. Shows enthusiasm for the role and company
        3. Mentions relevant skills for the position
        4. Highlights leadership and team collaboration experience
        5. Demonstrates problem-solving abilities and technical expertise
        6. Includes:
           - Professional greeting
           - 3-4 strong paragraphs
           - Professional closing
           - Proper spacing and formatting

        Keep the tone professional but enthusiastic. Focus on how the applicant's skills and experience 
        match the job requirements.
        """

        # Add custom instructions if provided
        if custom_instruction and custom_instruction.strip():
            prompt = base_prompt + f"\n\nAdditional customization requirements:\n{custom_instruction}"
        else:
            prompt = base_prompt

        # Generate cover letter
        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        response = model.generate_content(prompt, generation_config=model_config)

        if response and response.text:
            return {"success": True, "cover_letter": response.text.strip(), "language": language}
        else:
            return {"success": False, "error": "Failed to generate cover letter"}

    except Exception as e:
        return {"success": False, "error": f"Error generating cover letter: {str(e)}"}
