from flask import Blueprint, jsonify, request

from .cover_letter import generate_cover_letter
from .resume_analyzer import analyze_resume


# Create blueprint
api_bp = Blueprint("api", __name__, url_prefix="/api")


@api_bp.route("/analyze", methods=["POST"])
def analyze():
    """Endpoint to analyze resume against job descriptions"""
    if "resume" not in request.files:
        return jsonify({"success": False, "error": "No resume file provided"}), 400

    if "job_links" not in request.form:
        return jsonify({"success": False, "error": "No job links provided"}), 400

    resume = request.files["resume"]
    job_links = request.form["job_links"]

    if not resume.filename.endswith((".pdf", ".txt")):
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Invalid file format. Please upload PDF or TXT",
                }
            ),
            400,
        )

    result = analyze_resume(resume, job_links)

    if result.get("success", False):
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@api_bp.route("/cover-letter", methods=["POST"])
def generate_letter():
    """Endpoint to generate a cover letter"""
    data = request.json
    if not data or "job_link" not in data:
        return jsonify({"success": False, "error": "Missing job link"}), 400

    result = generate_cover_letter(data["job_link"])
    return jsonify(result), 200 if result.get("success", False) else 400


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200
