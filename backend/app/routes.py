from flask import Blueprint, jsonify, request

from .cover_letter import generate_cover_letter
from .job_scraper import scrape_job_description
from .resume_analyzer import analyze_resume, generate_resume_review


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

    # Get custom instructions if provided
    custom_instructions = request.form.get("custom_instructions", "")

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

    result = analyze_resume(resume, job_links, custom_instructions)

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

    # Get custom instruction if provided
    custom_instruction = data.get("custom_instruction", "")

    # Get language preference (default to English)
    language = data.get("language", "en")

    result = generate_cover_letter(data["job_link"], custom_instruction, language)
    return jsonify(result), 200 if result.get("success", False) else 400


@api_bp.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200


@api_bp.route("/review-resume", methods=["POST"])
def review_resume():
    """Endpoint to get detailed resume review"""
    if "resume" not in request.files:
        return jsonify({"success": False, "error": "No resume file provided"}), 400

    if "job_link" not in request.form:
        return jsonify({"success": False, "error": "No job link provided"}), 400

    resume = request.files["resume"]
    job_link = request.form["job_link"]

    # Get custom instructions if provided
    custom_instructions = request.form.get("custom_instructions", "")

    if not resume.filename.endswith((".pdf", ".txt")):
        return jsonify({"success": False, "error": "Invalid file format. Please upload PDF or TXT"}), 400

    # Get job description
    job_result = scrape_job_description(job_link)
    if not job_result["success"]:
        return jsonify(job_result), 400

    try:
        # Extract resume text (reuse from analyze_resume)
        if resume.filename.endswith(".pdf"):
            from .resume_analyzer import extract_text_from_pdf

            resume_content = extract_text_from_pdf(resume)
        else:
            resume_content = resume.read().decode("utf-8")

        # Generate review
        review_result = generate_resume_review(resume_content, job_result["description"], custom_instructions)
        if review_result.get("success", False):
            return jsonify(review_result), 200
        else:
            # Return more detailed error for debugging
            error_msg = review_result.get("error", "Unknown error")
            raw_response = review_result.get("raw_response", "")

            return jsonify({"success": False, "error": error_msg, "debug_info": raw_response}), 400

    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing resume: {str(e)}"}), 400


@api_bp.route("/review-resume-manual", methods=["POST"])
def review_resume_manual():
    """Endpoint to get detailed resume review with manual job description"""
    if "resume" not in request.files:
        return jsonify({"success": False, "error": "No resume file provided"}), 400

    if "job_description" not in request.form:
        return jsonify({"success": False, "error": "No job description provided"}), 400

    resume = request.files["resume"]
    job_description = request.form["job_description"]

    # Get custom instructions if provided
    custom_instructions = request.form.get("custom_instructions", "")

    if not resume.filename.endswith((".pdf", ".txt")):
        return jsonify({"success": False, "error": "Invalid file format. Please upload PDF or TXT"}), 400

    try:
        # Extract resume text
        if resume.filename.endswith(".pdf"):
            from .resume_analyzer import extract_text_from_pdf

            resume_content = extract_text_from_pdf(resume)
        else:
            resume_content = resume.read().decode("utf-8")

        # Generate review
        review_result = generate_resume_review(resume_content, job_description, custom_instructions)
        return jsonify(review_result), 200 if review_result["success"] else 400

    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing resume: {str(e)}"}), 400
    
@api_bp.route("/supported-languages", methods=["GET"])
def get_supported_languages():
    """Endpoint to get supported languages for cover letter generation"""
    supported_languages = [
        {"code": "en", "name": "English"},
        {"code": "es", "name": "Spanish (Español)"},
        {"code": "fr", "name": "French (Français)"},
        {"code": "de", "name": "German (Deutsch)"},
        {"code": "zh", "name": "Chinese (中文)"},
        {"code": "ja", "name": "Japanese (日本語)"},
        {"code": "pt", "name": "Portuguese (Português)"},
        {"code": "ru", "name": "Russian (Русский)"},
        {"code": "ar", "name": "Arabic (العربية)"}
    ]
    return jsonify({"success": True, "languages": supported_languages}), 200
