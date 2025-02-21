import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def scrape_job_description(job_url: str) -> dict:
    """
    Scrape job description from various job posting websites

    Args:
        job_url: URL of the job posting

    Returns:
        dict: Contains success status and either job description or error message
    """
    try:
        # Validate URL
        if not job_url or not urlparse(job_url).scheme:
            return {
                "success": False,
                "error": "Invalid URL provided"
            }

        # Add headers to mimic browser request
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        # Make request
        response = requests.get(job_url, headers=headers, timeout=10)
        response.raise_for_status()

        # Parse HTML
        soup = BeautifulSoup(response.text, "html.parser")

        # Try different common job description selectors
        selectors = [
            "div.job-description",
            "div[data-automation='jobDescription']",
            "#job-description",
            ".description__text",
            "div.description"
        ]

        for selector in selectors:
            job_description = soup.select_one(selector)
            if job_description:
                return {
                    "success": True,
                    "description": job_description.get_text(strip=True)
                }

        # If no description found with selectors, try finding by content
        description = soup.find(lambda tag: tag.name == "div" and
                                            any(keyword in tag.get_text().lower()
                                                for keyword in ["job description", "about this role", "about the role"]))

        if description:
            return {
                "success": True,
                "description": description.get_text(strip=True)
            }

        return {
            "success": False,
            "error": "Could not find job description on the page"
        }

    except requests.RequestException as e:
        logger.error(f"Request error for {job_url}: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to fetch job posting: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Unexpected error scraping {job_url}: {str(e)}")
        return {
            "success": False,
            "error": f"Error scraping job posting: {str(e)}"
        }