"""
Learning recommendations module.
This module generates learning resources for skills development.
"""

import json
import re
from typing import Dict, Any, List, Union

import google.generativeai as genai


def generate_learning_recommendations(skills: List[str]) -> Dict[str, Any]:
    """
    Generate learning recommendations for a list of skills.

    Args:
        skills: List of skills to find learning resources for

    Returns:
        dict: Learning recommendations for each skill
    """
    try:
        if not skills or not isinstance(skills, list) or len(skills) == 0:
            return {"success": False, "error": "No skills provided"}

        # Limit to 5 skills to prevent token limits
        if len(skills) > 5:
            skills = skills[:5]
            
        skills_list = "\n".join([f"- {skill}" for skill in skills])
        
        prompt = f"""
        You are a career development advisor specializing in technical skills. Provide learning resources for these skills:
        
        {skills_list}
        
        For each skill, recommend:
        1. 1-2 online courses (free or paid, with platform names)
        2. 1-2 articles or tutorials (with website names)
        3. 1-2 YouTube channels or specific videos
        4. A brief learning path from beginner to advanced
        
        Return ONLY a JSON object with this exact structure:
        {{
            "recommendations": [
                {{
                    "skill": "<skill name>",
                    "courses": [
                        {{
                            "title": "<course title>",
                            "platform": "<platform name>",
                            "url": "<generic url to platform>",
                            "is_free": true/false,
                            "difficulty": "Beginner/Intermediate/Advanced"
                        }}
                    ],
                    "articles": [
                        {{
                            "title": "<article title>",
                            "source": "<website/source name>",
                            "url": "<generic url to source>"
                        }}
                    ],
                    "videos": [
                        {{
                            "title": "<video/channel title>",
                            "creator": "<creator name>",
                            "platform": "YouTube",
                            "url": "<generic url to youtube>"
                        }}
                    ],
                    "learning_path": "<brief learning path from beginner to advanced>"
                }}
            ]
        }}
        
        IMPORTANT: 
        - For URLs, only use generic domain URLs (like "coursera.org", "youtube.com", "medium.com")
        - Do not create specific deep URLs that might not exist
        - Do not include specific course IDs or video IDs in URLs
        """

        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        response = model.generate_content(prompt, generation_config=model_config)
        if not response or not response.text:
            return {"success": False, "error": "No response from AI model"}

        # Extract and parse JSON
        json_str = re.search(r"({[\s\S]*})", response.text)
        if not json_str:
            return {"success": False, "error": "Invalid response format"}

        recommendations = json.loads(json_str.group(1))
        
        # Validate and ensure all required fields
        if "recommendations" not in recommendations or not isinstance(recommendations["recommendations"], list):
            return {"success": False, "error": "Invalid response structure"}
        
        return {"success": True, "recommendations": recommendations["recommendations"]}

    except Exception as e:
        return {"success": False, "error": f"Error generating learning recommendations: {str(e)}"}


def generate_detailed_learning_plan(skill: str) -> Dict[str, Any]:
    """
    Generate a detailed learning plan for a specific skill.

    Args:
        skill: The skill to generate a learning plan for

    Returns:
        dict: Detailed learning plan
    """
    try:
        prompt = f"""
        You are a technical education specialist. Create a comprehensive learning plan for this skill:
        
        Skill: {skill}
        
        Provide a detailed learning plan that includes:
        1. A learning roadmap from beginner to expert level
        2. Key concepts to master at each stage
        3. Recommended projects to build for practice
        4. Best resources for each level (courses, books, documentation)
        5. Estimated time investment for each level
        
        Return ONLY a JSON object with this exact structure:
        {{
            "skill": "{skill}",
            "overview": "<brief overview of the skill and its importance>",
            "levels": [
                {{
                    "level": "Beginner",
                    "description": "<description of this level>",
                    "key_concepts": ["<concept 1>", "<concept 2>"],
                    "resources": [
                        {{
                            "type": "Course/Book/Documentation/Tutorial",
                            "title": "<title>",
                            "source": "<platform or author>",
                            "description": "<brief description>"
                        }}
                    ],
                    "projects": ["<project 1>", "<project 2>"],
                    "estimated_time": "<estimated time to reach next level>"
                }},
                {{
                    "level": "Intermediate",
                    "description": "<description of this level>",
                    "key_concepts": ["<concept 1>", "<concept 2>"],
                    "resources": [
                        {{
                            "type": "Course/Book/Documentation/Tutorial",
                            "title": "<title>",
                            "source": "<platform or author>",
                            "description": "<brief description>"
                        }}
                    ],
                    "projects": ["<project 1>", "<project 2>"],
                    "estimated_time": "<estimated time to reach next level>"
                }},
                {{
                    "level": "Advanced",
                    "description": "<description of this level>",
                    "key_concepts": ["<concept 1>", "<concept 2>"],
                    "resources": [
                        {{
                            "type": "Course/Book/Documentation/Tutorial",
                            "title": "<title>",
                            "source": "<platform or author>",
                            "description": "<brief description>"
                        }}
                    ],
                    "projects": ["<project 1>", "<project 2>"],
                    "estimated_time": "<estimated time to mastery>"
                }}
            ]
        }}
        """

        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }

        response = model.generate_content(prompt, generation_config=model_config)
        if not response or not response.text:
            return {"success": False, "error": "No response from AI model"}

        # Extract and parse JSON
        json_str = re.search(r"({[\s\S]*})", response.text)
        if not json_str:
            return {"success": False, "error": "Invalid response format"}

        learning_plan = json.loads(json_str.group(1))
        
        return {"success": True, "learning_plan": learning_plan}

    except Exception as e:
        return {"success": False, "error": f"Error generating detailed learning plan: {str(e)}"}