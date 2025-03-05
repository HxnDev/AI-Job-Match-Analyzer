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


def extract_job_details(soup, url):
    """
    Extract job title, company name, and platform from job posting page.
    """
    platform = "Other"
    if "indeed.com" in url:
        platform = "Indeed"
    elif "linkedin.com" in url:
        platform = "LinkedIn"

    try:
        # Job Title Extraction
        title_selectors = {
            "indeed.com": ["h1.jobsearch-JobInfoHeader-title", "div.jobsearch-JobInfoHeader-title-container h1", "h1.icl-u-xs-mb--xs"],
            "linkedin.com": ["h1.top-card-layout__title", "h1.job-details-jobs-unified-top-card__job-title", "h1.topcard__title"],
            "generic": ["h1", "h1.job-title", "div.job-title", "title"],
        }

        job_title = None
        # Try platform-specific selectors first
        if "indeed.com" in url:
            for selector in title_selectors["indeed.com"]:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    job_title = element.text.strip()
                    break
        elif "linkedin.com" in url:
            for selector in title_selectors["linkedin.com"]:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    job_title = element.text.strip()
                    break

        # If no title found, try generic selectors
        if not job_title:
            for selector in title_selectors["generic"]:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    job_title = element.text.strip()
                    break

        # Company Name Extraction
        company_selectors = {
            "indeed.com": [
                'div[data-company-name="true"]',
                "div.jobsearch-CompanyInfoContainer span.jobsearch-CompanyInfoWithoutHeaderImage",
                "div.jobsearch-InlineCompanyRating > div:first-child",
            ],
            "linkedin.com": [
                "a.company-name-link",
                'a[data-tracking-control-name="public_jobs_topcard-org-name"]',
                "span.topcard__flavor",
                "a.sub-nav-cta__optional-url",
            ],
            "generic": ['div[class*="company"]', 'span[class*="company"]', 'div[class*="employer"]', 'span[class*="employer"]'],
        }

        company_name = None
        # Try platform-specific selectors
        if "indeed.com" in url:
            for selector in company_selectors["indeed.com"]:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    company_name = element.text.strip()
                    break
        elif "linkedin.com" in url:
            for selector in company_selectors["linkedin.com"]:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    company_name = element.text.strip()
                    break

        # If no company found, try generic selectors
        if not company_name:
            for selector in company_selectors["generic"]:
                element = soup.select_one(selector)
                if element and element.text.strip():
                    company_name = element.text.strip()
                    break

        return {"job_title": job_title or "Position Not Found", "company_name": company_name or "Company Not Found", "platform": platform}

    except Exception as e:
        logger.error(f"Error extracting job details: {str(e)}")
        return {"job_title": "Position Not Found", "company_name": "Company Not Found", "platform": platform}


def scrape_job_description(job_url: str) -> dict:
    """
    Scrape job description and metadata from various job posting websites.
    """
    try:
        if not job_url or not urlparse(job_url).scheme:
            return {"success": False, "error": "Invalid URL provided"}

        response = requests.get(job_url, headers=get_headers(), timeout=10)

        if response.status_code == 403:
            return {
                "success": True,
                "description": "Unable to automatically fetch job description. Please enter the job description manually.",
                "job_title": "Position Not Found",
                "company_name": "Company Not Found",
                "platform": "Unknown",
                "requires_manual_entry": True,
            }

        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        # Extract job details
        job_details = extract_job_details(soup, job_url)

        # Try different common job description selectors
        description_selectors = [
            "div.job-description",
            "div[data-automation='jobDescription']",
            "#job-description",
            ".description__text",
            "div.description",
            "div[class*='jobsearch-jobDescriptionText']",
            "div[class*='show-more-less-html']",
            "div[class*='job-description']",
        ]

        for selector in description_selectors:
            job_description = soup.select_one(selector)
            if job_description:
                return {"success": True, "description": job_description.get_text(strip=True), **job_details}

        # If no description found with selectors, try finding by content
        description = soup.find(lambda tag: tag.name == "div" and any(keyword in tag.get_text().lower() for keyword in ["job description", "about this role", "about the role"]))

        if description:
            return {"success": True, "description": description.get_text(strip=True), **job_details}

        return {
            "success": True,
            "description": "Unable to automatically extract job description. Please enter the job description manually.",
            **job_details,
            "requires_manual_entry": True,
        }

    except requests.RequestException as e:
        logger.error(f"Request error for {job_url}: {str(e)}")
        return {
            "success": True,
            "description": "Unable to fetch job description. Please enter it manually.",
            "job_title": "Position Not Found",
            "company_name": "Company Not Found",
            "platform": "Unknown",
            "requires_manual_entry": True,
        }
    except Exception as e:
        logger.error(f"Unexpected error scraping {job_url}: {str(e)}")
        return {
            "success": True,
            "description": "Error accessing job posting. Please enter the job description manually.",
            "job_title": "Position Not Found",
            "company_name": "Company Not Found",
            "platform": "Unknown",
            "requires_manual_entry": True,
        }
