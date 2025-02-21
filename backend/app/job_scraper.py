import requests
from bs4 import BeautifulSoup

def scrape_job_description(job_url):
    try:
        response = requests.get(job_url)
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract job description from the page
        job_description = soup.find("div", class_="job-description")
        return job_description.text.strip() if job_description else "No job description found."

    except Exception as e:
        return f"Error scraping job: {str(e)}"
