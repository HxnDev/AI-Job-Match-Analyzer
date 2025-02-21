from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from app.resume_analyzer import analyze_resume
from app.cover_letter import generate_cover_letter
from dotenv import load_dotenv

# Load env variables
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route("/api/analyze", methods=["POST"])
def analyze():
    data = request.json
    resume_text = data.get("resume_text", "")
    job_descriptions = data.get("job_descriptions", [])

    if not resume_text or not job_descriptions:
        return jsonify({"error": "Resume text and job descriptions are required"}), 400

    analysis_result = analyze_resume(resume_text, job_descriptions)
    return jsonify(analysis_result)

@app.route("/api/cover-letter", methods=["POST"])
def cover_letter():
    data = request.json
    resume_text = data.get("resume_text", "")
    job_description = data.get("job_description", "")

    if not resume_text or not job_description:
        return jsonify({"error": "Resume text and job description are required"}), 400

    cover_letter = generate_cover_letter(resume_text, job_description)
    return jsonify({"cover_letter": cover_letter})

if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Changed to avoid port conflicts
