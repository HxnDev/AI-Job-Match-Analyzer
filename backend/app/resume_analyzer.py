import openai
from app.config import OPENAI_API_KEY

openai.api_key = OPENAI_API_KEY

def analyze_resume_against_jobs(resume_text, job_descriptions):
    """
    Compares resume against multiple job descriptions using OpenAI.
    """
    results = []

    for job in job_descriptions:
        prompt = f"""
        Given the following resume:
        {resume_text}

        And this job description:
        {job}

        Rate how well the resume matches this job on a scale of 1-10.
        Also, list the missing skills.
        """

        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "You are an AI job match analyzer."},
                      {"role": "user", "content": prompt}]
        )

        ai_output = response["choices"][0]["message"]["content"]
        results.append(ai_output)

    return results
