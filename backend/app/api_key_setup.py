"""
API key setup utility module.
This module provides a GUI utility to set up and manage the Gemini API key.
"""

import json
import logging
import os
import sys
import tkinter as tk
from tkinter import messagebox, simpledialog


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def setup_api_key():
    """
    GUI utility to set up the Gemini API key.

    Returns:
        str: The configured API key or None if not configured
    """
    try:
        # Create and hide root window
        root = tk.Tk()
        root.withdraw()

        # Config file path - store in user's home directory
        config_dir = os.path.join(os.path.expanduser("~"), ".jobfit")
        config_file = os.path.join(config_dir, "config.json")

        # Check if config exists
        existing_key = None
        if os.path.exists(config_file):
            try:
                with open(config_file, "r") as f:
                    config = json.load(f)
                    existing_key = config.get("gemini_api_key")
            except Exception as e:
                logger.error(f"Error reading existing config: {str(e)}")

        # Prepare prompt message
        prompt = "Please enter your Gemini API Key to use JobFit:"
        if existing_key:
            # Mask the key for display
            masked_key = existing_key[:4] + "*" * (len(existing_key) - 8) + existing_key[-4:]
            prompt += f"\n(Current key: {masked_key})"

        # Add help text
        prompt += "\n\nYou can get a Gemini API key from:\nhttps://aistudio.google.com/app/apikey"

        # Prompt for API key
        api_key = simpledialog.askstring("JobFit Setup", prompt)

        if api_key:
            # Create config directory if it doesn't exist
            os.makedirs(config_dir, exist_ok=True)

            # Save API key to config file
            with open(config_file, "w") as f:
                json.dump({"gemini_api_key": api_key}, f)

            messagebox.showinfo("Setup Complete", "Gemini API key has been saved successfully.")
            return api_key
        elif existing_key:
            # If user cancels but there's an existing key, return it
            return existing_key
        else:
            # No key provided and no existing key
            messagebox.showwarning("Setup Incomplete", "No API key provided. JobFit requires a Gemini API key to function properly.")
            return None

    except Exception as e:
        logger.error(f"Error in API key setup: {str(e)}")
        # Fallback to command line if GUI fails
        if not sys.stdout.isatty():  # Check if running in a terminal
            return None

        print("\n===== JobFit Setup =====")
        print("Please enter your Gemini API key:")
        print("(You can get one from: https://aistudio.google.com/app/apikey)")
        api_key = input("> ")

        if api_key:
            # Create config directory if it doesn't exist
            os.makedirs(config_dir, exist_ok=True)

            # Save API key to config file
            with open(config_file, "w") as f:
                json.dump({"gemini_api_key": api_key}, f)

            print("API key saved successfully!")
            return api_key
        else:
            print("No API key provided. Some features may not work.")
            return None


def get_api_key():
    """
    Get the stored API key without prompting.

    Returns:
        str: The stored API key or None if not found
    """
    config_file = os.path.join(os.path.expanduser("~"), ".jobfit", "config.json")

    if os.path.exists(config_file):
        try:
            with open(config_file, "r") as f:
                config = json.load(f)
                return config.get("gemini_api_key")
        except Exception as e:
            logger.error(f"Error reading config file: {str(e)}")

    return None


if __name__ == "__main__":
    # When run directly, prompt for API key setup
    setup_api_key()
