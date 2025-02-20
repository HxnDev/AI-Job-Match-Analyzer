import os
import logging
import openai
from flask import Blueprint, request, jsonify

resume_analyzer_bp = Blueprint('resume_analyzer', __name__)

# Set the OpenAI API key from the environment
openai.api_key = os.getenv("OPENAI_API_KEY")

def get_ai_score(resume_text, job_link):
    prompt = (
        f"Given the following resume:\n\n{resume_text}\n\n"
        f"and the job posting at {job_link}, rate the candidate's suitability on a scale from 1 to 10. "
        "Return only the numerical score."
    )
    try:
        response = openai.ChatCompletion.create(
            model="o1-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10,
        )
        score_text = response.choices[0].message.content.strip()
        # Attempt to convert the score to a number; if not possible, return None.
        score = float(score_text) if score_text.replace('.', '', 1).isdigit() else None
    except Exception as e:
        logging.error(f"Error in get_ai_score: {e}")
        score = None
    return score

def get_ai_comments(resume_text, job_link):
    prompt = (
        f"Given the following resume:\n\n{resume_text}\n\n"
        f"and the job posting at {job_link}, provide a concise analysis of the candidate's suitability."
    )
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=100,
        )
        comments = response.choices[0].message.content.strip()
    except Exception as e:
        logging.error(f"Error in get_ai_comments: {e}")
        comments = "Unable to generate comments at this time."
    return comments

@resume_analyzer_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.get_json()
    resume_text = data.get("resume", "")
    job_links = data.get("jobLinks", [])
    results = []
    for link in job_links:
        score = get_ai_score(resume_text, link)
        comments = get_ai_comments(resume_text, link)
        results.append({
            "jobLink": link,
            "aiScore": score,
            "aiComments": comments
        })
    return jsonify({"results": results})
