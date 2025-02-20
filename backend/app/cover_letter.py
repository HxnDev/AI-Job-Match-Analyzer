import openai
from app.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def generate_cover_letter(resume_text, job_description):
    """
    Generates a customized AI-powered cover letter.
    """
    prompt = f"""
    Given the following resume:
    {resume_text}

    And this job description:
    {job_description}

    Write a personalized cover letter tailored to this job.
    """

    response = openai.ChatCompletion.create(
        model="gpt-4o",
        messages=[{"role": "system", "content": "You are an AI cover letter generator."},
                  {"role": "user", "content": prompt}]
    )

    return response["choices"][0]["message"]["content"]
