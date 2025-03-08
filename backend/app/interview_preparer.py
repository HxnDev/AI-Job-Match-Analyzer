"""
Interview question generation module.
This module generates tailored interview questions based on job descriptions.
"""

import json
import logging
import re
from typing import Any, Dict

import google.generativeai as genai


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def generate_interview_questions(job_details: Dict[str, str]) -> Dict[str, Any]:
    """
    Generate interview questions based on job details.

    Args:
        job_details: Dictionary containing job title, company name, and job description

    Returns:
        dict: Contains success status and either the generated questions or error message
    """
    try:
        # Extract job details
        job_title = job_details.get("job_title", "")
        company_name = job_details.get("company_name", "")
        job_description = job_details.get("job_description", "")

        logger.info(f"Generating interview questions for: {job_title} at {company_name}")

        # Create job context
        job_context = f"Job Title: {job_title}\nCompany Name: {company_name}\n"
        if job_description:
            # Truncate job description if it's very long
            if len(job_description) > 1000:  # Reduced from 2000 to 1000
                logger.info(f"Truncating job description from {len(job_description)} to 1000 chars")
                job_context += f"Job Description: {job_description[:1000]}...\n"
            else:
                job_context += f"Job Description: {job_description}\n"

        # Create prompt for interview question generation - REDUCED NUMBER OF QUESTIONS
        prompt = f"""
        You are an expert interview coach preparing candidates for job interviews. Generate interview questions based on this job:

        {job_context}

        Create a set of 8 interview questions that would likely be asked for this position, organized into these categories:
        1. Technical Skills Questions (2 questions): Questions about technical abilities and hard skills required
        2. Behavioral Questions (2 questions): Scenario-based questions about past experiences
        3. Role-Specific Questions (2 questions): Questions unique to this particular role
        4. Company/Industry Knowledge (1 question): Questions testing understanding of the company or industry
        5. Problem-Solving Questions (1 question): Questions that assess analytical thinking

        For each question, include:
        - The actual question
        - The category it belongs to
        - Difficulty level (Easy, Medium, Hard)
        - 2-3 key points that should be addressed in an ideal answer
        - A brief note on why this question matters for this role

        Return ONLY a JSON object with this exact structure:
        {{
            "questions": [
                {{
                    "id": 1,
                    "question": "Question text",
                    "category": "Technical Skills|Behavioral|Role-Specific|Company Knowledge|Problem-Solving",
                    "difficulty": "Easy|Medium|Hard",
                    "key_points": ["Key point 1", "Key point 2", "Key point 3"],
                    "importance": "Why this question matters for this role"
                }},
                // more questions...
            ],
            "preparation_tips": [
                "General tip 1 for this interview",
                "General tip 2 for this interview"
            ],
            "key_skills_to_emphasize": [
                "Skill 1",
                "Skill 2"
            ]
        }}

        Ensure the JSON is properly formatted with exactly 8 questions total, distributed as specified across categories.
        Use double quotes for all keys and string values. Ensure all arrays and objects are properly terminated with appropriate brackets and commas.
        """

        # Generate interview questions with lower temperature for more deterministic output
        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.3,  # Reduced from 0.7 to get more consistent outputs
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        logger.info("Sending request to AI model for interview questions")
        response = model.generate_content(prompt, generation_config=model_config)

        if not response or not response.text:
            logger.error("No response from AI model")
            return {"success": False, "error": "No response from AI model"}

        # Extract and parse JSON with better error handling
        try:
            # Find the JSON content using regex
            json_str = re.search(r"({[\s\S]*})", response.text)
            if not json_str:
                logger.error("No JSON found in response")
                logger.error(f"Full response: {response.text}")
                return {"success": False, "error": "Invalid response format: JSON not found"}

            # Extract the JSON string
            extracted_json = json_str.group(1)

            # More aggressive JSON cleaning
            # Replace single quotes with double quotes
            cleaned_json = re.sub(r"'([^']*)':", r'"\1":', extracted_json)
            cleaned_json = re.sub(r": \'([^\']*)\'", r': "\1"', cleaned_json)

            # Fix missing commas in arrays
            cleaned_json = re.sub(r'"\s*\n\s*"', '", "', cleaned_json)

            # Fix trailing commas in arrays and objects
            cleaned_json = re.sub(r",\s*}", "}", cleaned_json)
            cleaned_json = re.sub(r",\s*]", "]", cleaned_json)

            # Fix any JSON comments
            cleaned_json = re.sub(r"//.*?\n", "", cleaned_json)

            # Fix any malformed quotes or escapes
            cleaned_json = cleaned_json.replace('\\"', '"')
            cleaned_json = re.sub(r'([^\\])"([^"]*)":', r'\1"\2":', cleaned_json)

            logger.info(f"Cleaned JSON (first 200 chars): {cleaned_json[:200]}...")

            try:
                # Try to parse the JSON
                interview_data = json.loads(cleaned_json)
                logger.info("Successfully parsed JSON response")
            except json.JSONDecodeError as e:
                logger.error(f"First JSON parsing attempt failed: {e}")

                # If direct parsing fails, try more aggressive cleaning or fallback to a minimal structure
                try:
                    # Try to manually fix common issues like missing commas between objects
                    # This is a simplified approach - in a real system you might want more robust handling
                    cleaned_json = re.sub(r"}\s*{", "},{", cleaned_json)
                    interview_data = json.loads(cleaned_json)
                    logger.info("JSON parsed after additional cleaning")
                except json.JSONDecodeError as json_error:  # Specify the exception type
                    # If all parsing attempts fail, return a minimal structure
                    logger.error(f"All JSON parsing attempts failed: {str(json_error)}, using fallback structure")
                    interview_data = {
                        "questions": [
                            {
                                "id": 1,
                                "question": f"Tell me about your relevant experience for this {job_title} role.",
                                "category": "Role-Specific",
                                "difficulty": "Medium",
                                "key_points": ["Highlight relevant skills", "Discuss similar past work", "Connect experience to job requirements"],
                                "importance": "Establishes your qualifications for the position",
                            },
                            {
                                "id": 2,
                                "question": f"Why are you interested in working at {company_name}?",
                                "category": "Company Knowledge",
                                "difficulty": "Easy",
                                "key_points": ["Show research on company", "Connect values to personal goals", "Express genuine interest"],
                                "importance": "Demonstrates company fit and preparation",
                            },
                        ],
                        "preparation_tips": ["Research the company thoroughly", "Practice your responses out loud", "Prepare specific examples from your experience"],
                        "key_skills_to_emphasize": ["Communication", "Problem-solving", "Teamwork"],
                    }

            # Ensure required fields are present
            if "questions" not in interview_data or not isinstance(interview_data["questions"], list):
                interview_data["questions"] = []

            if "preparation_tips" not in interview_data or not isinstance(interview_data["preparation_tips"], list):
                interview_data["preparation_tips"] = []

            if "key_skills_to_emphasize" not in interview_data or not isinstance(interview_data["key_skills_to_emphasize"], list):
                interview_data["key_skills_to_emphasize"] = []

            # Ensure each question has all required fields
            for i, question in enumerate(interview_data["questions"]):
                if "id" not in question:
                    question["id"] = i + 1

                if "question" not in question or not question["question"]:
                    question["question"] = f"Question {i+1} about {job_title}"

                if "category" not in question or not question["category"]:
                    question["category"] = "General"

                if "difficulty" not in question or not question["difficulty"]:
                    question["difficulty"] = "Medium"

                if "key_points" not in question or not isinstance(question["key_points"], list):
                    question["key_points"] = ["Prepare a concise answer", "Include relevant examples", "Be specific"]

                if "importance" not in question or not question["importance"]:
                    question["importance"] = f"This question helps assess your fit for the {job_title} role"

            # Add job details to the response
            interview_data["job_title"] = job_title
            interview_data["company_name"] = company_name

            return {"success": True, "interview_data": interview_data}

        except Exception as e:
            logger.error(f"Error during interview question parsing: {str(e)}", exc_info=True)
            # Provide a fallback response with some default questions
            fallback_data = {
                "questions": [
                    {
                        "id": 1,
                        "question": f"Tell me about your relevant experience for this {job_title} role.",
                        "category": "Role-Specific",
                        "difficulty": "Medium",
                        "key_points": ["Highlight relevant skills", "Discuss similar past work", "Connect experience to job requirements"],
                        "importance": "Establishes your qualifications for the position",
                    },
                    {
                        "id": 2,
                        "question": f"Why are you interested in working at {company_name}?",
                        "category": "Company Knowledge",
                        "difficulty": "Easy",
                        "key_points": ["Show research on company", "Connect values to personal goals", "Express genuine interest"],
                        "importance": "Demonstrates company fit and preparation",
                    },
                ],
                "preparation_tips": ["Research the company thoroughly", "Practice your responses out loud", "Prepare specific examples from your experience"],
                "key_skills_to_emphasize": ["Communication", "Problem-solving", "Teamwork"],
                "job_title": job_title,
                "company_name": company_name,
            }

            return {"success": True, "interview_data": fallback_data, "note": "Using fallback questions due to processing error"}

    except Exception as e:
        logger.error(f"Error generating interview questions: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error generating interview questions: {str(e)}"}


def generate_company_research(company_name: str) -> Dict[str, Any]:
    """
    Generate company research guidance for interview preparation.

    Args:
        company_name: Name of the company

    Returns:
        dict: Contains success status and either the research points or error message
    """
    try:
        if not company_name:
            return {
                "success": True,
                "research_points": [
                    "Research the company's mission and values",
                    "Learn about the company's products or services",
                    "Understand their market position and competitors",
                    "Check recent news articles about the company",
                    "Review the company's culture and work environment",
                ],
            }

        prompt = f"""
        You are preparing a job candidate for an interview with {company_name}. 
        
        Generate a list of 5-8 company research points that would be helpful for the candidate to investigate before the interview.
        
        These points should help the candidate:
        1. Understand the company's business model and products/services
        2. Learn about the company's culture, values, and mission
        3. Identify talking points that show interest in the company
        4. Prepare for company-specific questions
        
        Format your response as a JSON array of research points:
        [
            "Research point 1",
            "Research point 2",
            "Research point 3",
            "Research point 4",
            "Research point 5"
        ]
        
        Keep each point concise and actionable.
        """

        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt, generation_config={"temperature": 0.2, "max_output_tokens": 1024})

        if not response or not response.text:
            return {
                "success": True,
                "research_points": [
                    f"Research {company_name}'s mission and values",
                    f"Learn about {company_name}'s products or services",
                    f"Understand {company_name}'s market position and competitors",
                    f"Check recent news articles about {company_name}",
                    f"Review {company_name}'s culture and work environment",
                ],
            }

        # Extract JSON array
        try:
            # Find brackets for JSON array
            array_match = re.search(r"(\[[\s\S]*\])", response.text)
            if array_match:
                research_points = json.loads(array_match.group(1))
                return {"success": True, "research_points": research_points}
            else:
                # Fallback to simple extraction of list items
                points = re.findall(r'"([^"]*)"', response.text)
                if points:
                    return {"success": True, "research_points": points}
                else:
                    points = re.findall(r"- (.*)", response.text)
                    if points:
                        return {"success": True, "research_points": points}

                    # Final fallback
                    return {
                        "success": True,
                        "research_points": [
                            f"Research {company_name}'s mission and values",
                            f"Learn about {company_name}'s products or services",
                            f"Understand {company_name}'s market position and competitors",
                            f"Check recent news articles about {company_name}",
                            f"Review {company_name}'s culture and work environment",
                        ],
                    }
        except json.JSONDecodeError as json_error:
            # Fallback to default list
            logger.error(f"Error parsing company research JSON: {str(json_error)}")
            return {
                "success": True,
                "research_points": [
                    f"Research {company_name}'s mission and values",
                    f"Learn about {company_name}'s products or services",
                    f"Understand {company_name}'s market position and competitors",
                    f"Check recent news articles about {company_name}",
                    f"Review {company_name}'s culture and work environment",
                ],
            }

    except Exception as e:
        logger.error(f"Error generating company research: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error generating company research: {str(e)}"}


def generate_interview_preparation_materials(job_details: Dict[str, str]) -> Dict[str, Any]:
    """
    Generate comprehensive interview preparation materials.

    Args:
        job_details: Dictionary containing job title, company name, and job description

    Returns:
        dict: Contains success status and preparation materials
    """
    try:
        # Generate interview questions
        questions_result = generate_interview_questions(job_details)
        if not questions_result["success"]:
            return questions_result

        # Generate company research points
        company_name = job_details.get("company_name", "")
        research_result = generate_company_research(company_name)

        # Combine results
        prep_materials = {"success": True, "interview_data": questions_result["interview_data"], "company_research": research_result.get("research_points", [])}

        return prep_materials

    except Exception as e:
        logger.error(f"Error generating interview preparation materials: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error generating interview preparation materials: {str(e)}"}
