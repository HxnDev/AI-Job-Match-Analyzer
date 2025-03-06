"""
Email reply generation module.
This module generates professional email replies based on input emails.
"""

from typing import Dict

import google.generativeai as genai


def generate_email_reply(email_content: str, reply_tone: str = "professional", language: str = "en") -> Dict[str, any]:
    """
    Generate a professional email reply based on an input email.

    Args:
        email_content: The content of the email to reply to
        reply_tone: The tone of the reply (professional, friendly, formal)
        language: Language code (default: "en" for English)

    Returns:
        dict: Contains success status and either the email reply or error message
    """
    try:
        # Determine language instruction
        language_instructions = {
            "en": "Write the email reply in English.",
            "es": "Escribe la respuesta del correo electrónico en español (Spanish).",
            "fr": "Écris la réponse d'email en français (French).",
            "de": "Schreibe die E-Mail-Antwort auf Deutsch (German).",
            "zh": "用中文写电子邮件回复 (Chinese).",
            "ja": "メールの返信を日本語で書いてください (Japanese).",
            "pt": "Escreva a resposta de e-mail em português (Portuguese).",
            "ru": "Напишите ответ на электронное письмо на русском языке (Russian).",
            "ar": "اكتب رد البريد الإلكتروني باللغة العربية (Arabic).",
        }

        # Default to English if language not supported
        language_instruction = language_instructions.get(language, language_instructions["en"])

        # Determine tone instructions
        tone_instructions = {
            "professional": "Keep the tone professional, clear, and straightforward.",
            "friendly": "Keep the tone friendly and approachable while remaining professional.",
            "formal": "Keep the tone formal and conservative, appropriate for official correspondence.",
        }

        # Default to professional if tone not supported
        tone_instruction = tone_instructions.get(reply_tone, tone_instructions["professional"])

        # Create prompt for email reply generation
        prompt = f"""
        You are a professional email writer. Create a well-crafted reply to the following email.

        Original email:
        {email_content}

        {language_instruction}
        {tone_instruction}

        Your email reply should:
        1. Include an appropriate greeting
        2. Acknowledge the original email's content
        3. Address all questions or requests from the original email
        4. Be concise but thorough
        5. Include a professional closing
        6. Have proper formatting for a business email

        IMPORTANT: If the original email is not clear or incomplete, make reasonable assumptions 
        to craft a helpful response, but note any areas where more information might be needed.
        """

        # Generate email reply
        model = genai.GenerativeModel("gemini-2.0-flash")
        model_config = {
            "temperature": 0.7,
            "top_p": 0.8,
            "top_k": 40,
            "max_output_tokens": 2048,
        }
        response = model.generate_content(prompt, generation_config=model_config)

        if response and response.text:
            return {"success": True, "reply": response.text.strip(), "language": language}
        else:
            return {"success": False, "error": "Failed to generate email reply"}

    except Exception as e:
        return {"success": False, "error": f"Error generating email reply: {str(e)}"}
