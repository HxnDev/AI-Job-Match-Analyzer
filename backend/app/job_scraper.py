import requests
from bs4 import BeautifulSoup

def extract_job_description(url):
    """
    Extracts job descriptions from given URLs using web scraping.
    """
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Try to extract job description from common tags
        job_desc = soup.find("div", class_="job-description") or \
                   soup.find("section", class_="description") or \
                   soup.find("article")

        return job_desc.get_text(strip=True) if job_desc else "Job description not found."

    except Exception as e:
        return f"Error fetching job description: {e}"
