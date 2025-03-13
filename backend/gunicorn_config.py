"""
Gunicorn configuration for production deployment.
"""

import os
import multiprocessing

# Bind to PORT if provided by environment (like on Render)
port = os.getenv("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Worker configuration - optimize for memory usage on free tier
# Use single worker to stay within resource limits
workers = 1
worker_class = "sync"

# Optimize timeouts for Gemini API calls
# These might take longer than default timeouts
timeout = 120  # Seconds
keepalive = 5  # Seconds

# Logging
accesslog = "-"  # Log to stdout
errorlog = "-"   # Log to stderr
loglevel = "info"

# Reload on code changes - can disable in production
reload = False  # Set to False for production

# Memory optimization settings 
max_requests = 10      # Restart workers after handling max_requests to free memory
max_requests_jitter = 5  # Add randomness to max_requests to avoid all workers restarting at once
worker_tmp_dir = "/tmp"  # Use /tmp for worker heartbeat to reduce disk I/O