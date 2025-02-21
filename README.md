# Job Match Analyzer

A powerful open-source tool that helps job seekers analyze their resumes against job descriptions and generate AI-powered cover letters. Built with React and Flask, it leverages Google's Gemini AI for intelligent analysis and runs completely locally.

## Features
- 📄 Resume Analysis: Upload PDF/TXT files or paste resume text directly
- 🔗 Multiple Job Links: Analyze your resume against multiple job postings simultaneously
- 🎯 Smart Matching: AI-powered skill matching and gap analysis
- ✍️ Cover Letters: Generate tailored cover letters for each job
- 🔒 Privacy-First: Runs locally, your data stays on your machine
- 💰 Cost-Effective: Uses Gemini AI (free tier available)

## Tech Stack
### Frontend
- React 18.2
- Mantine UI 6.0.22 (for components and styling)
- Vite (for development and building)
- Axios (for API calls)
- ESLint & Prettier (for code quality)

### Backend
- Flask 2.2.5
- Google Generative AI (Gemini)
- PyPDF2 (for PDF processing)
- Beautiful Soup 4 (for web scraping)
- Ruff (for code quality)

## Demo Video

![Demo Video](https://github.com/HxnDev/Job-Match-Analyzer/blob/main/frontend/public/JobMatchAnalyzerDemo-ezgif.com-video-to-gif-converter%20(1).gif)



## Project Structure

### Frontend Structure
```
frontend/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
├── src/
│   ├── components/               # Reusable components
│   │   ├── JobInput.jsx
│   │   ├── JobResults.jsx
│   │   └── ResumeUpload.jsx
│   ├── pages/
│   │   └── Home.jsx              # Main page component
│   ├── App.jsx                   # App root component
│   └── index.jsx                 # Entry point
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── index.html
├── package.json
└── vite.config.js
```

### Backend Structure
```
backend/
├── app/
│   ├── __init__.py              # App initialization
│   ├── main.py                  # Entry point
│   ├── routes.py                # API routes
│   ├── resume_analyzer.py       # Resume analysis logic
│   ├── cover_letter.py          # Cover letter generation
│   └── job_scraper.py           # Job description scraping
├── .env                         # Environment variables
├── ruff.toml                    # Ruff configuration
├── Makefile                     # Development commands
├── .pre-commit-config.yaml      # Pre-commit configuration
└── requirements.txt             # Python dependencies
```

## Prerequisites
- Node.js (v14 or higher)
- Python 3.11 or higher
- Google Cloud Console account for Gemini API key

## Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/HxnDev/Job-Match-Analyzer.git
cd Job-Match-Analyzer
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Check code quality
make check

# Fix formatting issues
make format
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Check code quality
npm run check

# Fix formatting issues
npm run format

# Start development server
npm run dev
```

### 4. Get Gemini API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable the Gemini API
4. Create API credentials
5. Copy the API key to your backend `.env` file

### 5. Run the Application
```bash
# Terminal 1 (Backend)
cd backend
python -m app.main

# Terminal 2 (Frontend)
cd frontend
npm run dev
```

Visit `http://localhost:5173` to use the application.

## Code Quality

### Frontend
- ESLint for linting
- Prettier for code formatting
- Run checks: `npm run check`
- Fix formatting: `npm run format`

### Backend
- Ruff for both linting and formatting
- Run checks: `make check`
- Fix formatting: `make format`

## API Documentation

### POST /api/analyze
Analyzes resume against job descriptions.
- Request: Multipart form data
  - `resume`: PDF/TXT file
  - `job_links`: JSON string of URLs
- Response: JSON with analysis results

### POST /api/cover-letter
Generates a cover letter.
- Request: JSON
  - `job_link`: String
- Response: JSON with generated cover letter

## Contributing

### Commit Message Format
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Tests
- chore: Maintenance

Example:
feat(frontend): add job link validation
```

### Pull Request Process
1. Create a feature branch: `feature/description` or `fix/description`
2. Follow commit message format
3. Update documentation if needed
4. Ensure all code quality checks pass
5. Request review from maintainers

### Code Style
- Frontend: Follow React best practices, use functional components
- Backend: Follow PEP 8 guidelines via Ruff
- Document all functions with docstrings
- Maintain consistent error handling

## Why Gemini AI?
1. Free Tier Available: Unlike GPT-4, Gemini offers generous free usage
2. Strong Performance: Comparable results to other LLMs
3. Easy Integration: Simple Python SDK
4. Cost-Effective: Perfect for open-source projects

## License
MIT License. See [LICENSE](LICENSE) for details.

## Support
- 🐛 Found a bug? [Open an issue](https://github.com/HxnDev/Job-Match-Analyzer/issues)
- 💡 Have an idea? [Submit a feature request](https://github.com/HxnDev/Job-Match-Analyzer/issues)
- 🤝 Want to contribute? [Check our contribution guide](#contributing)

## Author
[Hassan Shahzad](https://github.com/HxnDev)
