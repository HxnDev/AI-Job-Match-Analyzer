#!/usr/bin/env python3
"""
JobFit API Key Setup Tool
Standalone tool to set up or update the Gemini API key for JobFit.
"""

import os
import sys
import json
import tkinter as tk
from tkinter import simpledialog, messagebox
import webbrowser

def setup_api_key():
    """
    GUI utility to set up the Gemini API key.
    """
    # Config file path - store in user's home directory
    config_dir = os.path.join(os.path.expanduser("~"), ".jobfit")
    config_file = os.path.join(config_dir, "config.json")
    
    # Check if config exists
    existing_key = None
    if os.path.exists(config_file):
        try:
            with open(config_file, 'r') as f:
                config = json.load(f)
                existing_key = config.get('gemini_api_key')
        except Exception as e:
            print(f"Error reading existing config: {str(e)}")
    
    # Create and configure root window
    root = tk.Tk()
    root.title("JobFit API Key Setup")
    
    # Center window
    window_width = 450
    window_height = 220
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    x = (screen_width - window_width) // 2
    y = (screen_height - window_height) // 2
    root.geometry(f"{window_width}x{window_height}+{x}+{y}")
    root.resizable(False, False)
    
    # Helper function to open Gemini API key page
    def open_api_page():
        webbrowser.open("https://aistudio.google.com/app/apikey")
    
    # Title
    tk.Label(root, text="JobFit API Key Setup", font=("Arial", 16, "bold")).pack(pady=(15, 5))
    
    # Instructions
    tk.Label(root, text="Enter your Gemini API key to use JobFit's AI features", 
             font=("Arial", 10)).pack(pady=(0, 10))
    
    # API Key entry
    frame = tk.Frame(root)
    frame.pack(fill=tk.X, padx=20)
    
    tk.Label(frame, text="API Key:", font=("Arial", 10, "bold")).pack(anchor="w")
    
    entry_var = tk.StringVar()
    if existing_key:
        entry_var.set(existing_key)
    
    entry = tk.Entry(frame, textvariable=entry_var, width=50, show="•")
    entry.pack(fill=tk.X, pady=(5, 0))
    
    # Show/Hide API key
    def toggle_show_key():
        if entry['show'] == "•":
            entry.config(show="")
            show_button.config(text="Hide API Key")
        else:
            entry.config(show="•")
            show_button.config(text="Show API Key")
    
    show_button = tk.Button(frame, text="Show API Key", command=toggle_show_key)
    show_button.pack(anchor="e", pady=(5, 0))
    
    # Helper text
    text_frame = tk.Frame(root)
    text_frame.pack(fill=tk.X, padx=20, pady=(5, 0))
    
    tk.Label(text_frame, text="Don't have an API key?", font=("Arial", 9)).pack(side=tk.LEFT)
    
    link = tk.Label(text_frame, text="Get one here", font=("Arial", 9), fg="blue", cursor="hand2")
    link.pack(side=tk.LEFT, padx=(5, 0))
    link.bind("<Button-1>", lambda e: open_api_page())
    
    # Buttons
    button_frame = tk.Frame(root)
    button_frame.pack(fill=tk.X, padx=20, pady=(15, 0))
    
    def save_api_key():
        api_key = entry_var.get().strip()
        
        if not api_key:
            messagebox.showerror("Error", "Please enter a valid API key")
            return
        
        try:
            # Create config directory if it doesn't exist
            os.makedirs(config_dir, exist_ok=True)
            
            # Save API key to config file
            with open(config_file, 'w') as f:
                json.dump({"gemini_api_key": api_key}, f)
            
            messagebox.showinfo("Success", "API key saved successfully!")
            root.destroy()
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save API key: {str(e)}")
    
    def cancel():
        root.destroy()
    
    save_button = tk.Button(button_frame, text="Save", command=save_api_key, 
                           bg="#4CAF50", fg="white", width=10)
    save_button.pack(side=tk.RIGHT, padx=(5, 0))
    
    cancel_button = tk.Button(button_frame, text="Cancel", command=cancel, width=10)
    cancel_button.pack(side=tk.RIGHT)
    
    # Start the GUI event loop
    root.mainloop()

if __name__ == "__main__":
    setup_api_key()