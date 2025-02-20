import os
import logging
import openai
from flask import Blueprint, request, jsonify

cover_letter_bp = Blueprint('cover_letter', __name__)

# Use the same OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

@cover_letter_bp.route('/cover-letter', methods=['POST'])
def generate_cover_letter():
    data = request.get_json()
    resume_text = data.get("resume", "")
    job_link = data.get("jobLink", "")
    prompt = (
        f"Using the following resume:\n\n{resume_text}\n\n"
        f"Generate a customized cover letter for the job posting at {job_link}."
    )
    try:
        response = openai.ChatCompletion.create(
            model="o1-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
        )
        cover_letter = response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error generating cover letter: {e}")
        cover_letter = "Unable to generate cover letter at this time."
    return jsonify({"coverLetter": cover_letter})
