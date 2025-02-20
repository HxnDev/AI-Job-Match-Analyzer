from fastapi import FastAPI, UploadFile, Form
from typing import List
from app.job_scraper import extract_job_description
from app.resume_analyzer import analyze_resume_against_jobs
from app.cover_letter import generate_cover_letter

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Job Match Analyzer API is running"}

@app.post("/analyze/")
async def analyze_jobs(resume: UploadFile, job_links: List[str] = Form(...)):
    """
    Analyzes resume against multiple job descriptions.
    """
    resume_text = (await resume.read()).decode("utf-8")

    job_descriptions = [extract_job_description(link) for link in job_links]
    analysis_results = analyze_resume_against_jobs(resume_text, job_descriptions)

    return {"job_analysis": analysis_results}

@app.post("/generate-cover-letter/")
async def cover_letter(resume: UploadFile, job_description: str = Form(...)):
    """
    Generates a cover letter tailored to a job description.
    """
    resume_text = (await resume.read()).decode("utf-8")
    cover_letter_text = generate_cover_letter(resume_text, job_description)

    return {"cover_letter": cover_letter_text}
