import hashlib
from typing import List
from urllib.parse import urlparse
import uuid
import requests
import re
import string

from bisect import bisect_right


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


def clean_text(text):
    # Remove newline characters
    text = text.replace("\n", " ")

    # Remove punctuation
    text = text.translate(str.maketrans("", "", string.punctuation))

    return text


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
        "Connection": "keep-alive",
    }

    session = requests.Session()
    response = session.get(url, headers=headers)
    response.raise_for_status()

    # Save the content to a file
    with open(file_path, "wb") as file:
        file.write(response.content)


def find_sentence_endings(text: str) -> List[int]:
    # Regex to find periods, exclamation marks, and question marks followed by a space or the end of the text
    sentence_endings = [match.end() for match in re.finditer(r'[.!?](?:\s|$)', text)]

    # Add the last index of the text as an additional sentence ending
    sentence_endings.append(len(text))

    return sentence_endings

def find_following_sentence_ending(sentence_endings: List[int], index: int) -> int:
    """
    Find the closest sentence ending that follows the given index.

    Args:
        sentence_endings: Sorted list of sentence ending positions
        index: Current position in text

    Returns:
        Next sentence ending position or original index if none found
    """
    pos = bisect_right(sentence_endings, index)
    return sentence_endings[pos] if pos < len(sentence_endings) else index
