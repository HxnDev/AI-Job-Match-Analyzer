from flask import Blueprint, request, jsonify
from .resume_analyzer import analyze_resume
from .cover_letter import generate_cover_letter

# Create blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/analyze', methods=['POST'])
def analyze():
    """
    Endpoint to analyze resume against job descriptions
    """
    # Validate input
    if 'resume' not in request.files:
        return jsonify({"success": False, "error": "No resume file provided"}), 400

    if 'job_links' not in request.form:
        return jsonify({"success": False, "error": "No job links provided"}), 400

    resume = request.files['resume']
    job_links = request.form['job_links']

    # Validate file type
    if not resume.filename.endswith(('.pdf', '.doc', '.docx', '.txt')):
        return jsonify({
            "success": False,
            "error": "Invalid file format. Please upload PDF, DOC, DOCX, or TXT"
        }), 400

    # Analyze resume
    result = analyze_resume(resume, job_links)

    if result.get("success", False):
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@api_bp.route('/cover-letter', methods=['POST'])
def generate_letter():
    """
    Endpoint to generate a cover letter
    """
    data = request.json
    if not data or 'resume' not in data or 'job_description' not in data:
        return jsonify({
            "success": False,
            "error": "Missing resume or job description"
        }), 400

    cover_letter = generate_cover_letter(data['resume'], data['job_description'])
    return jsonify({"success": True, "cover_letter": cover_letter})

@api_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    return jsonify({"status": "healthy"}), 200