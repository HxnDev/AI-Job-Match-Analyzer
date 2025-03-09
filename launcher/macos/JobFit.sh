#!/bin/bash
# JobFit launcher script for macOS

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Start the JobFit application
echo "Starting JobFit..."
"$SCRIPT_DIR/JobFit" &