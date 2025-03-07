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
                            "is_free": true,
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
        - Use double quotes for all JSON properties and string values
        - Use true/false without quotes for boolean values
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

        try:
            # Try to parse the JSON directly
            recommendations = json.loads(json_str.group(1))
        except json.JSONDecodeError as e:
            # If there's an error, try to clean up the JSON
            cleaned_json = json_str.group(1)
            
            # Replace single quotes with double quotes (common issue)
            cleaned_json = re.sub(r"'([^']+)':", r'"\1":', cleaned_json)
            cleaned_json = re.sub(r": '([^']+)'", r': "\1"', cleaned_json)
            
            # Fix boolean values (another common issue)
            cleaned_json = cleaned_json.replace("'true'", "true").replace("'false'", "false")
            
            try:
                # Try to parse again after cleanup
                recommendations = json.loads(cleaned_json)
            except json.JSONDecodeError:
                # If still failing, return a fallback response with error info
                return {
                    "success": False, 
                    "error": f"Could not parse AI response as JSON: {str(e)}",
                    "raw_response": response.text[:500]  # Include part of the response for debugging
                }
        
        # Validate and ensure all required fields
        if "recommendations" not in recommendations or not isinstance(recommendations["recommendations"], list):
            return {"success": False, "error": "Invalid response structure"}
        
        # Ensure each recommendation has the expected structure with defaults if missing
        for i, rec in enumerate(recommendations["recommendations"]):
            # Ensure skill property exists
            if "skill" not in rec:
                rec["skill"] = skills[i] if i < len(skills) else "Unknown skill"
            
            # Ensure required arrays exist
            if "courses" not in rec or not isinstance(rec["courses"], list):
                rec["courses"] = []
            
            if "articles" not in rec or not isinstance(rec["articles"], list):
                rec["articles"] = []
                
            if "videos" not in rec or not isinstance(rec["videos"], list):
                rec["videos"] = []
            
            # Ensure learning_path exists
            if "learning_path" not in rec or not isinstance(rec["learning_path"], str):
                rec["learning_path"] = "Start with fundamentals, practice with projects, advance to complex applications."
                
            # Validate course objects
            for j, course in enumerate(rec["courses"]):
                if not isinstance(course, dict):
                    rec["courses"][j] = {
                        "title": "Recommended Course",
                        "platform": "Online Learning Platform",
                        "url": "coursera.org",
                        "is_free": False,
                        "difficulty": "Intermediate"
                    }
                else:
                    # Ensure all course properties exist
                    if "title" not in course:
                        course["title"] = "Recommended Course"
                    if "platform" not in course:
                        course["platform"] = "Online Learning Platform"
                    if "url" not in course:
                        course["url"] = "coursera.org"
                    if "is_free" not in course:
                        course["is_free"] = False
                    if "difficulty" not in course:
                        course["difficulty"] = "Intermediate"
            
            # Validate article objects
            for j, article in enumerate(rec["articles"]):
                if not isinstance(article, dict):
                    rec["articles"][j] = {
                        "title": "Recommended Article",
                        "source": "Technical Blog",
                        "url": "medium.com"
                    }
                else:
                    # Ensure all article properties exist
                    if "title" not in article:
                        article["title"] = "Recommended Article"
                    if "source" not in article:
                        article["source"] = "Technical Blog"
                    if "url" not in article:
                        article["url"] = "medium.com"
            
            # Validate video objects
            for j, video in enumerate(rec["videos"]):
                if not isinstance(video, dict):
                    rec["videos"][j] = {
                        "title": "Recommended Video",
                        "creator": "Educational Channel",
                        "platform": "YouTube",
                        "url": "youtube.com"
                    }
                else:
                    # Ensure all video properties exist
                    if "title" not in video:
                        video["title"] = "Recommended Video"
                    if "creator" not in video:
                        video["creator"] = "Educational Channel"
                    if "platform" not in video:
                        video["platform"] = "YouTube"
                    if "url" not in video:
                        video["url"] = "youtube.com"
        
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
        
        IMPORTANT:
        - Use double quotes for all property names and string values in the JSON
        - Ensure all arrays and objects are properly formatted
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

        try:
            # Try to parse the JSON directly
            learning_plan = json.loads(json_str.group(1))
        except json.JSONDecodeError as e:
            # If there's an error, try to clean up the JSON
            cleaned_json = json_str.group(1)
            
            # Replace single quotes with double quotes (common issue)
            cleaned_json = re.sub(r"'([^']+)':", r'"\1":', cleaned_json)
            cleaned_json = re.sub(r": '([^']+)'", r': "\1"', cleaned_json)
            
            try:
                # Try to parse again after cleanup
                learning_plan = json.loads(cleaned_json)
            except json.JSONDecodeError:
                # If still failing, return a fallback response with error info
                return {
                    "success": False, 
                    "error": f"Could not parse AI response as JSON: {str(e)}",
                    "raw_response": response.text[:500]  # Include part of the response for debugging
                }
        
        # Validate and ensure all required fields with defaults if missing
        if not isinstance(learning_plan, dict):
            return {"success": False, "error": "Invalid learning plan structure"}
        
        # Ensure basic properties
        if "skill" not in learning_plan:
            learning_plan["skill"] = skill
            
        if "overview" not in learning_plan:
            learning_plan["overview"] = f"A comprehensive learning path for mastering {skill}"
        
        # Ensure levels array exists and has proper structure
        if "levels" not in learning_plan or not isinstance(learning_plan["levels"], list):
            learning_plan["levels"] = [
                {
                    "level": "Beginner",
                    "description": f"Introduction to {skill}",
                    "key_concepts": ["Basic concepts"],
                    "resources": [{"type": "Tutorial", "title": "Getting Started", "source": "Official Documentation", "description": "Introduction to the fundamentals"}],
                    "projects": ["Simple practice project"],
                    "estimated_time": "2-4 weeks"
                },
                {
                    "level": "Intermediate",
                    "description": f"Building on {skill} fundamentals",
                    "key_concepts": ["Intermediate concepts"],
                    "resources": [{"type": "Course", "title": "Intermediate Skills", "source": "Online Platform", "description": "Developing more advanced knowledge"}],
                    "projects": ["More complex project"],
                    "estimated_time": "1-3 months"
                },
                {
                    "level": "Advanced",
                    "description": f"Mastering {skill}",
                    "key_concepts": ["Advanced concepts"],
                    "resources": [{"type": "Book", "title": "Advanced Techniques", "source": "Expert Author", "description": "In-depth coverage of advanced topics"}],
                    "projects": ["Comprehensive real-world project"],
                    "estimated_time": "3-6 months"
                }
            ]
        else:
            # Validate and fix each level
            for level in learning_plan["levels"]:
                # Check required string fields
                for field in ["level", "description", "estimated_time"]:
                    if field not in level or not isinstance(level[field], str):
                        if field == "level":
                            level[field] = "Skill Level"
                        elif field == "description":
                            level[field] = "Level description"
                        else:  # estimated_time
                            level[field] = "1-3 months"
                
                # Check required array fields
                for field in ["key_concepts", "projects"]:
                    if field not in level or not isinstance(level[field], list):
                        level[field] = []
                
                # Check resources array
                if "resources" not in level or not isinstance(level["resources"], list):
                    level["resources"] = []
                
                # Check each resource
                for i, resource in enumerate(level["resources"]):
                    if not isinstance(resource, dict):
                        level["resources"][i] = {
                            "type": "Resource",
                            "title": "Learning Resource",
                            "source": "Provider",
                            "description": "Resource description"
                        }
                    else:
                        # Ensure all resource properties exist
                        for field in ["type", "title", "source", "description"]:
                            if field not in resource or not isinstance(resource[field], str):
                                if field == "type":
                                    resource[field] = "Resource"
                                elif field == "title":
                                    resource[field] = "Learning Resource"
                                elif field == "source":
                                    resource[field] = "Provider"
                                else:  # description
                                    resource[field] = "Resource description"
        
        return {"success": True, "learning_plan": learning_plan}

    except Exception as e:
        return {"success": False, "error": f"Error generating detailed learning plan: {str(e)}"}