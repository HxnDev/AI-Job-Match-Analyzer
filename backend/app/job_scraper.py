import logging
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_headers():
    """Get headers that mimic a real browser."""
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }


def scrape_job_description(job_url: str) -> dict:
    """
    Scrape job description from various job posting websites.
    Includes fallback for blocked requests.

    Args:
        job_url: URL of the job posting

    Returns:
        dict: Contains success status and either job description or error message
    """
    try:
        # Validate URL
        if not job_url or not urlparse(job_url).scheme:
            return {"success": False, "error": "Invalid URL provided"}

        # Make request with enhanced headers
        response = requests.get(job_url, headers=get_headers(), timeout=10)

        # Handle various response scenarios
        if response.status_code == 403:
            return {
                "success": True,
                "description": "Unable to automatically fetch job description. Please enter the job description "
                "manually or try a different job posting link.",
                "requires_manual_entry": True,
            }

        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Try different common job description selectors
        selectors = [
            "div.job-description",
            "div[data-automation='jobDescription']",
            "#job-description",
            ".description__text",
            "div.description",
            "div[class*='jobsearch-jobDescriptionText']",  # Indeed
            "div[class*='show-more-less-html']",  # LinkedIn
            "div[class*='job-description']",  # Generic
        ]

        for selector in selectors:
            job_description = soup.select_one(selector)
            if job_description:
                return {"success": True, "description": job_description.get_text(strip=True)}

        # If no description found with selectors, try finding by content
        description = soup.find(
            lambda tag: tag.name == "div"
            and any(keyword in tag.get_text().lower() for keyword in ["job description", "about this role", "about the role"])
        )

        if description:
            return {"success": True, "description": description.get_text(strip=True)}

        return {
            "success": True,
            "description": "Unable to automatically extract job description. Please enter the job description manually.",
            "requires_manual_entry": True,
        }

    except requests.RequestException as e:
        logger.error(f"Request error for {job_url}: {str(e)}")
        return {"success": True, "description": "Unable to fetch job description. Please enter it manually.", "requires_manual_entry": True}
    except Exception as e:
        logger.error(f"Unexpected error scraping {job_url}: {str(e)}")
        return {
            "success": True,
            "description": "Error accessing job posting. Please enter the job description manually.",
            "requires_manual_entry": True,
        }
