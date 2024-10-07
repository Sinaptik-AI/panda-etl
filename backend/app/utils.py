import hashlib
from urllib.parse import urlparse
import uuid
import requests
import re


def generate_unique_filename(url, extension=".html"):
    url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
    unique_id = uuid.uuid4().hex
    filename = f"{url_hash}_{unique_id}{extension}"
    return filename


def is_valid_url(url):
    # Define the regular expression for URL validation
    regex = re.compile(
        r"^(?:http|ftp)s?://"  # http:// or https://
        r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|"  # domain...
        r"localhost|"  # localhost...
        r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}|"  # ...or ipv4
        r"\[?[A-F0-9]*:[A-F0-9:]+\]?)"  # ...or ipv6
        r"(?::\d+)?"  # optional port
        r"(?:/?|[/?]\S+)$",
        re.IGNORECASE,
    )

    return re.match(regex, url) is not None


def fetch_html_and_save(url, file_path):
    parsed_url = urlparse(url)
    if not parsed_url.scheme:
        url = "https://" + url

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) "
            "Gecko/20100101 Firefox/91.0"
        ),
        "Referer": url,
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
    }

    session = requests.Session()
    response = session.get(url, headers=headers)
    response.raise_for_status()

    # Save the content to a file
    with open(file_path, "wb") as file:
        file.write(response.content)
