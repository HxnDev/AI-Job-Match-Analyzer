"""
Interview answer evaluation module.
This module evaluates user answers to interview questions and provides feedback and scoring.
"""

import json
import logging
import re
from typing import Any, Dict, List

import google.generativeai as genai


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def evaluate_answer(question: Dict[str, Any], answer: str) -> Dict[str, Any]:
    """
    Evaluate a user's answer to an interview question.

    Args:
        question: Dictionary containing the question details
        answer: User's answer to the question

    Returns:
        dict: Evaluation of the answer including score and feedback
    """
    try:
        if not answer or not question:
            return {"score": 0, "feedback": "No answer provided.", "strengths": [], "areas_for_improvement": [], "sample_answer": ""}

        # Extract question information
        question_text = question.get("question", "")
        category = question.get("category", "")
        key_points = question.get("key_points", [])

        # Create evaluation prompt
        key_points_text = "\n".join([f"- {point}" for point in key_points])

        prompt = f"""
        You are an expert interview coach evaluating a candidate's answer to an interview question.

        Question: "{question_text}"
        Category: {category}
        Key points that should be addressed:
        {key_points_text}

        Candidate's answer: "{answer}"

        Evaluate the answer on a scale of 1-10 based on the following criteria:
        1. How well it addresses the key points (60%)
        2. Clarity and conciseness (20%)
        3. Relevance to the question (20%)

        Provide a comprehensive analysis of the answer including:
        1. Overall score (1-10)
        2. Specific strengths (2-3 points)
        3. Areas for improvement (2-3 points)
        4. A sample strong answer for reference

        Return ONLY a JSON object with this exact structure:
        {{
            "score": 7,
            "feedback": "Your overall analysis of the answer",
            "strengths": [
                "Strength 1",
                "Strength 2"
            ],
            "areas_for_improvement": [
                "Improvement 1",
                "Improvement 2"
            ],
            "sample_answer": "A sample strong answer to this question"
        }}
        """

        # Generate evaluation
        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.4,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        logger.info(f"Evaluating answer for question: {question_text[:50]}...")
        response = model.generate_content(prompt, generation_config=model_config)

        if not response or not response.text:
            logger.error("No response from AI model")
            return {"score": 5, "feedback": "Unable to evaluate the answer at this time.", "strengths": [], "areas_for_improvement": ["Please try again later."], "sample_answer": ""}

        # Extract and parse JSON with better error handling
        try:
            # Find the JSON content using regex
            json_str = re.search(r"({[\s\S]*})", response.text)
            if not json_str:
                logger.error("No JSON found in response")
                logger.error(f"Full response: {response.text}")
                return {"score": 5, "feedback": "Unable to process the evaluation at this time.", "strengths": [], "areas_for_improvement": ["Please try again later."], "sample_answer": ""}

            # Extract and clean the JSON string
            extracted_json = json_str.group(1)

            # Clean up common formatting issues
            cleaned_json = re.sub(r"'([^']*)':", r'"\1":', extracted_json)
            cleaned_json = re.sub(r": \'([^\']*)\'", r': "\1"', cleaned_json)

            # Fix missing commas in arrays
            cleaned_json = re.sub(r'"\s*\n\s*"', '", "', cleaned_json)

            # Fix trailing commas in arrays and objects
            cleaned_json = re.sub(r",\s*}", "}", cleaned_json)
            cleaned_json = re.sub(r",\s*]", "]", cleaned_json)

            # Parse the JSON
            evaluation = json.loads(cleaned_json)

            # Ensure required fields
            required_fields = ["score", "feedback", "strengths", "areas_for_improvement", "sample_answer"]
            for field in required_fields:
                if field not in evaluation:
                    if field in ["strengths", "areas_for_improvement"]:
                        evaluation[field] = []
                    else:
                        evaluation[field] = "" if field != "score" else 5

            # Validate score is within range
            if not isinstance(evaluation["score"], (int, float)) or evaluation["score"] < 1 or evaluation["score"] > 10:
                evaluation["score"] = 5

            return evaluation

        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Problematic JSON: {json_str.group(1)[:500] if json_str else 'No JSON found'}")

            # Return a default evaluation
            return {
                "score": 5,
                "feedback": "We encountered an error while evaluating your answer.",
                "strengths": ["Your answer was received."],
                "areas_for_improvement": ["Please try again later."],
                "sample_answer": "",
            }

    except Exception as e:
        logger.error(f"Error evaluating answer: {str(e)}", exc_info=True)
        return {"score": 5, "feedback": f"Error during evaluation: {str(e)}", "strengths": [], "areas_for_improvement": ["Please try again later."], "sample_answer": ""}


def evaluate_interview_answers(question_answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Evaluate all answers from a mock interview.

    Args:
        question_answers: List of dictionaries containing questions and user answers

    Returns:
        dict: Contains success status and overall evaluation
    """
    try:
        if not question_answers or not isinstance(question_answers, list):
            return {"success": False, "error": "No valid question-answer pairs provided"}

        total_questions = len(question_answers)
        if total_questions == 0:
            return {"success": False, "error": "No questions provided"}

        logger.info(f"Evaluating {total_questions} interview answers")

        # Evaluate each answer
        evaluations = []
        total_score = 0

        for qa_pair in question_answers:
            question = qa_pair.get("question", {})
            answer = qa_pair.get("answer", "")

            # Skip if either question or answer is missing
            if not question or not answer:
                continue

            # Evaluate this answer
            evaluation = evaluate_answer(question, answer)

            # Add to evaluations list with question info
            evaluations.append(
                {
                    "question_id": question.get("id"),
                    "question_text": question.get("question"),
                    "category": question.get("category"),
                    "difficulty": question.get("difficulty"),
                    "answer": answer,
                    "evaluation": evaluation,
                }
            )

            # Add to total score
            total_score += evaluation.get("score", 0)

        # Calculate overall score and readiness
        evaluated_count = len(evaluations)
        average_score = total_score / evaluated_count if evaluated_count > 0 else 0

        # Determine readiness level
        readiness_level = "High" if average_score >= 8 else "Medium" if average_score >= 6 else "Low"

        # Generate overall feedback based on evaluations
        overall_feedback = generate_overall_feedback(evaluations, average_score, readiness_level)

        return {
            "success": True,
            "overall_score": round(average_score, 1),
            "readiness_level": readiness_level,
            "overall_feedback": overall_feedback.get("overall_feedback", ""),
            "strengths": overall_feedback.get("strengths", []),
            "areas_for_improvement": overall_feedback.get("areas_for_improvement", []),
            "next_steps": overall_feedback.get("next_steps", []),
            "evaluations": evaluations,
        }

    except Exception as e:
        logger.error(f"Error evaluating interview answers: {str(e)}", exc_info=True)
        return {"success": False, "error": f"Error evaluating interview answers: {str(e)}"}


def generate_overall_feedback(evaluations: List[Dict[str, Any]], average_score: float, readiness_level: str) -> Dict[str, Any]:
    """
    Generate overall feedback based on individual answer evaluations.

    Args:
        evaluations: List of evaluation results
        average_score: Average score across all answers
        readiness_level: Overall readiness level (High, Medium, Low)

    Returns:
        dict: Overall feedback including strengths, areas for improvement, and next steps
    """
    try:
        if not evaluations:
            return {"overall_feedback": "No answers were evaluated.", "strengths": [], "areas_for_improvement": [], "next_steps": ["Practice more interview questions."]}

        # Extract categories from evaluations
        categories = {}
        all_strengths = []
        all_improvement_areas = []

        for eval_data in evaluations:
            category = eval_data.get("category", "General")
            score = eval_data.get("evaluation", {}).get("score", 0)

            # Track category scores
            if category not in categories:
                categories[category] = {"total": 0, "count": 0}
            categories[category]["total"] += score
            categories[category]["count"] += 1

            # Collect all strengths and improvement areas
            strengths = eval_data.get("evaluation", {}).get("strengths", [])
            improvements = eval_data.get("evaluation", {}).get("areas_for_improvement", [])

            all_strengths.extend(strengths)
            all_improvement_areas.extend(improvements)

        # Calculate category averages
        category_averages = {}
        for cat, data in categories.items():
            category_averages[cat] = data["total"] / data["count"] if data["count"] > 0 else 0

        # Determine strongest and weakest categories
        sorted_categories = sorted(category_averages.items(), key=lambda x: x[1], reverse=True)
        strongest_categories = [cat for cat, score in sorted_categories[:2]] if len(sorted_categories) >= 2 else [cat for cat, score in sorted_categories]
        weakest_categories = [cat for cat, score in sorted_categories[-2:]] if len(sorted_categories) >= 2 else [cat for cat, score in sorted_categories]

        # Create prompt for generating consolidated feedback
        prompt = f"""
        You are an expert interview coach. Based on the following interview evaluation data, provide comprehensive feedback to the candidate.

        Overall Score: {average_score:.1f}/10
        Readiness Level: {readiness_level}
        
        Strongest Categories: {', '.join(strongest_categories)}
        Areas Needing Improvement: {', '.join(weakest_categories)}
        
        Individual Strengths Identified:
        {', '.join(all_strengths[:10]) if all_strengths else 'None specified'}
        
        Individual Areas for Improvement:
        {', '.join(all_improvement_areas[:10]) if all_improvement_areas else 'None specified'}
        
        Please provide:
        1. An overall assessment of the candidate's interview performance
        2. 3-5 key strengths consolidated from the evaluations
        3. 3-5 key areas for improvement
        4. 3-5 specific next steps or practice recommendations
        
        Return ONLY a JSON object with this exact structure:
        {{
            "overall_feedback": "Comprehensive assessment of the candidate's performance",
            "strengths": [
                "Key strength 1",
                "Key strength 2",
                "Key strength 3"
            ],
            "areas_for_improvement": [
                "Area for improvement 1",
                "Area for improvement 2",
                "Area for improvement 3"
            ],
            "next_steps": [
                "Specific recommendation 1",
                "Specific recommendation 2",
                "Specific recommendation 3"
            ]
        }}
        """

        # Generate consolidated feedback
        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.4,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        response = model.generate_content(prompt, generation_config=model_config)

        if not response or not response.text:
            logger.error("No response from AI model for overall feedback")
            return {
                "overall_feedback": f"Based on your answers, your interview readiness level is {readiness_level.lower()} with an average score of {average_score:.1f}/10.",
                "strengths": all_strengths[:3] if all_strengths else ["No specific strengths identified."],
                "areas_for_improvement": all_improvement_areas[:3] if all_improvement_areas else ["Continue practicing interview questions."],
                "next_steps": ["Practice more interview questions in the categories you scored lowest."],
            }

        # Extract and parse JSON
        try:
            json_str = re.search(r"({[\s\S]*})", response.text)
            if not json_str:
                raise ValueError("No JSON found in response")

            feedback_data = json.loads(json_str.group(1))

            # Ensure all required fields are present
            if "overall_feedback" not in feedback_data:
                feedback_data["overall_feedback"] = f"Based on your answers, your interview readiness level is {readiness_level.lower()} with an average score of {average_score:.1f}/10."

            if "strengths" not in feedback_data or not isinstance(feedback_data["strengths"], list):
                feedback_data["strengths"] = all_strengths[:3] if all_strengths else ["No specific strengths identified."]

            if "areas_for_improvement" not in feedback_data or not isinstance(feedback_data["areas_for_improvement"], list):
                feedback_data["areas_for_improvement"] = all_improvement_areas[:3] if all_improvement_areas else ["Continue practicing interview questions."]

            if "next_steps" not in feedback_data or not isinstance(feedback_data["next_steps"], list):
                feedback_data["next_steps"] = ["Practice more interview questions in the categories you scored lowest."]

            return feedback_data

        except (json.JSONDecodeError, ValueError) as e:
            logger.error(f"Error parsing overall feedback: {str(e)}")

            # Provide default feedback
            return {
                "overall_feedback": f"Based on your answers, your interview readiness level is {readiness_level.lower()} with an average score of {average_score:.1f}/10.",
                "strengths": all_strengths[:3] if all_strengths else ["No specific strengths identified."],
                "areas_for_improvement": all_improvement_areas[:3] if all_improvement_areas else ["Continue practicing interview questions."],
                "next_steps": ["Practice more interview questions in the categories you scored lowest."],
            }

    except Exception as e:
        logger.error(f"Error generating overall feedback: {str(e)}", exc_info=True)
        return {
            "overall_feedback": f"Your interview readiness level is {readiness_level} with a score of {average_score:.1f}/10.",
            "strengths": ["Unable to identify specific strengths at this time."],
            "areas_for_improvement": ["Continue practicing interview questions."],
            "next_steps": ["Practice more interview questions and try again."],
        }
