from flask import Blueprint, jsonify, request
import json
import logging

from .ats_analyzer import analyze_ats_compatibility, generate_optimized_resume_sections
from .cover_letter import generate_cover_letter
from .email_reply import generate_email_reply
from .job_scraper import scrape_job_description
from .learning_recommender import generate_learning_recommendations, generate_detailed_learning_plan
from .motivational_message import generate_motivational_letter
from .resume_analyzer import analyze_resume, generate_resume_review

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    job_links_str = request.form["job_links"]

    # UPDATED: More robust JSON parsing with better error handling
    try:
        # Parse JSON string with better error handling
        job_links = json.loads(job_links_str)
        
        # Log the parsed job links for debugging
        logger.info(f"Parsed job links: {job_links}")
        
        # Ensure it's a list (even if a single string came through)
        if not isinstance(job_links, list):
            job_links = [job_links]
            
    except json.JSONDecodeError as e:
        # Log the error and problematic string for debugging
        logger.error(f"JSON parsing error: {str(e)}")
        logger.error(f"Problematic JSON string: {job_links_str[:100]}")
        return jsonify({"success": False, "error": f"Invalid job links format: {str(e)}"}), 400

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
        # UPDATED: Include more detailed error information
        error_msg = result.get("error", "Unknown error")
        logger.error(f"Resume analysis failed: {error_msg}")
        return jsonify(result), 400

@api_bp.route("/ats-check", methods=["POST"])
def ats_check():
    """Endpoint to analyze resume for ATS compatibility"""
    if "resume" not in request.files:
        return jsonify({"success": False, "error": "No resume file provided"}), 400

    resume = request.files["resume"]

    if not resume.filename.endswith((".pdf", ".txt")):
        return jsonify({"success": False, "error": "Invalid file format. Please upload PDF or TXT"}), 400

    try:
        # Extract resume text
        if resume.filename.endswith(".pdf"):
            from .resume_analyzer import extract_text_from_pdf
            resume_content = extract_text_from_pdf(resume)
        else:
            resume_content = resume.read().decode("utf-8")

        # Analyze ATS compatibility
        result = analyze_ats_compatibility(resume_content)
        return jsonify(result), 200 if result.get("success", False) else 400

    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing resume: {str(e)}"}), 400


@api_bp.route("/ats-optimize", methods=["POST"])
def ats_optimize():
    """Endpoint to get ATS-optimized resume sections"""
    if "resume" not in request.files:
        return jsonify({"success": False, "error": "No resume file provided"}), 400

    if "job_description" not in request.form:
        return jsonify({"success": False, "error": "No job description provided"}), 400

    resume = request.files["resume"]
    job_description = request.form["job_description"]

    if not resume.filename.endswith((".pdf", ".txt")):
        return jsonify({"success": False, "error": "Invalid file format. Please upload PDF or TXT"}), 400

    try:
        # Extract resume text
        if resume.filename.endswith(".pdf"):
            from .resume_analyzer import extract_text_from_pdf
            resume_content = extract_text_from_pdf(resume)
        else:
            resume_content = resume.read().decode("utf-8")

        # Generate optimized sections
        result = generate_optimized_resume_sections(resume_content, job_description)
        return jsonify(result), 200 if result.get("success", False) else 400

    except Exception as e:
        return jsonify({"success": False, "error": f"Error processing resume: {str(e)}"}), 400


@api_bp.route("/learning-recommendations", methods=["POST"])
def learning_recommendations():
    """Endpoint to get learning recommendations for skills"""
    data = request.json
    if not data or "skills" not in data or not isinstance(data["skills"], list):
        return jsonify({"success": False, "error": "No skills provided or invalid format"}), 400

    result = generate_learning_recommendations(data["skills"])
    return jsonify(result), 200 if result.get("success", False) else 400


@api_bp.route("/learning-plan", methods=["POST"])
def learning_plan():
    """Endpoint to get a detailed learning plan for a skill"""
    data = request.json
    if not data or "skill" not in data:
        return jsonify({"success": False, "error": "No skill provided"}), 400

    result = generate_detailed_learning_plan(data["skill"])
    return jsonify(result), 200 if result.get("success", False) else 400

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


@api_bp.route("/motivational-letter", methods=["POST"])
def motivational_letter():
    """Endpoint to generate a motivational letter"""
    data = request.json
    if not data or "job_title" not in data:
        return jsonify({"success": False, "error": "Missing job title"}), 400

    # Get job description if available
    job_description = data.get("job_description", "")

    # Get custom instruction if provided
    custom_instruction = data.get("custom_instruction", "")

    # Add custom instructions to the job description if provided
    if custom_instruction and custom_instruction.strip():
        job_description = f"{job_description}\n\nAdditional requirements: {custom_instruction}"

    result = generate_motivational_letter(data["job_title"])
    return jsonify(result), 200 if result.get("success", False) else 400


@api_bp.route("/email-reply", methods=["POST"])
def email_reply():
    """Endpoint to generate an email reply"""
    data = request.json
    if not data or "email_content" not in data:
        return jsonify({"success": False, "error": "Missing email content"}), 400

    # Get tone preference (default to professional)
    tone = data.get("tone", "professional")

    # Get language preference (default to English)
    language = data.get("language", "en")

    result = generate_email_reply(data["email_content"], tone, language)
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
        {"code": "ar", "name": "Arabic (العربية)"},
    ]
    return jsonify({"success": True, "languages": supported_languages}), 200


@api_bp.route("/email-tones", methods=["GET"])
def get_email_tones():
    """Endpoint to get supported email tones"""
    email_tones = [{"code": "professional", "name": "Professional"}, {"code": "friendly", "name": "Friendly"}, {"code": "formal", "name": "Formal"}]
    return jsonify({"success": True, "tones": email_tones}), 200
