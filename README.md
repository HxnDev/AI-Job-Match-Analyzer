# Open-Source Job Match Analyzer

## Project Overview

This is an open-source tool that helps job seekers analyze job descriptions against their resumes and generate AI-powered cover letters. The tool runs locally and supports multiple job posting links at once.

## Features

- Upload or paste resume
- Enter multiple job posting links
- AI-based job matching score and skill gap analysis
- Generate AI-powered cover letters
- Runs locally with a simple React frontend and FastAPI backend

## Tech Stack

- **Frontend:** React (with Tailwind CSS for styling)
- **Backend:** FastAPI (Python)
- **AI Model:** OpenAI's GPT-4 (or DeepSeek as an alternative)
- **Web Scraping:** BeautifulSoup, Playwright (for extracting job descriptions)

---

## Repository Setup Instructions (Using GitHub Desktop)

### 1. Create a New Repository on GitHub

1. Open **GitHub Desktop**.
2. Click **File > New Repository**.
3. Enter **Repository Name** (e.g., `job-match-analyzer`).
4. Set **Local Path** to a folder on your system.
5. Set **Git Ignore** to `Python`.
6. Click **Create Repository**.
7. Click **Publish Repository** to push it to GitHub.

### 2. Clone Repository (if already created on GitHub)

1. Open **GitHub Desktop**.
2. Click **File > Clone Repository**.
3. Select your GitHub repo and click **Clone**.

### 3. Set Up Project Structure

```plaintext
job-match-analyzer/
│── backend/              # FastAPI Backend
│   ├── main.py           # API Endpoints
│   ├── requirements.txt  # Dependencies
│   ├── .env              # API Keys (ignored in .gitignore)
│── frontend/             # React Frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│── README.md            # Project Documentation
│── .gitignore           # Ignore environment files
```

### 4. Install Dependencies

#### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend (React)

```bash
cd frontend
npm install
```

### 5. Run the Project

#### Start Backend

```bash
cd backend
uvicorn main:app --reload
```

#### Start Frontend

```bash
cd frontend
npm start
```

## Contributing

Fork the repository.
Clone your fork and create a new branch.
Make changes and push to your branch.
Open a pull request on GitHub.

## License

This project is open-source and available under the MIT License.

## Contact

For any queries, feel free to open an issue or contribute to the discussion.
