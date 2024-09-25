import json
import os
from typing import List
from app.exceptions import CreditLimitExceededException
import requests
from app.config import settings
from app.logger import Logger

logger = Logger()


def request_api_key(email: str):
    url = f"{settings.api_server_url}/api/auth/register-pandaetl"

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json={"email": email}, headers=headers)

    if response.status_code not in [200, 201]:
        logger.error(
            f"Failed to request API key. It returned {response.status_code} code: {response.text}"
        )
        raise Exception(f"Failed to request API key")

    try:
        data = response.json()
    except requests.exceptions.JSONDecodeError:
        logger.error(f"Invalid JSON response from API server: {response.text}")
        raise Exception("Invalid JSON response")

    return data.get("message", "No message in response")


def extract_text_from_file(api_token: str, file_path: str, type: str):
    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}
    files = {}
    file = open(file_path, "rb")
    files["file"] = (os.path.basename(file_path), file)

    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/file/content",
        files=files,
        headers=headers,
        timeout=360,
    )

    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        logger.error(
            f"Unable to process file ${file_path} during text extraction. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process file!")


def extract_data(api_token, fields, file_path=None, pdf_content=None):
    fields_data = fields if isinstance(fields, str) else json.dumps(fields)

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"fields": fields_data}
    files = {}

    if file_path:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file at {file_path} does not exist.")

        file = open(file_path, "rb")
        files["file"] = (os.path.basename(file_path), file)

    elif pdf_content:
        data["pdf_content"] = pdf_content

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract",
        files=files if files else None,
        data=data,
        headers=headers,
        timeout=360,
    )

    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()

    elif response.status_code == 402:
        raise CreditLimitExceededException(
            response.json().get("detail", "Credit limit exceeded!")
        )

    else:
        logger.error(
            f"Unable to process file ${file_path} during extraction. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process file!")


def extract_field_descriptions(api_token, fields):

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"fields": fields}

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/field-descriptions",
        json=data,
        headers=headers,
        timeout=360,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        logger.error(
            f"Unable to process file during field description generation. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process file!")


def extract_summary(api_token, config, file_path=None, pdf_content=None):
    config_data = config if isinstance(config, str) else json.dumps(config)
    pdf_content_data = (
        config if isinstance(pdf_content, str) else json.dumps(pdf_content)
    )

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"config": config_data}
    files = {}

    if file_path:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file at {file_path} does not exist.")

        file = open(file_path, "rb")
        files["file"] = (os.path.basename(file_path), file)

    elif pdf_content:
        data["content"] = pdf_content_data

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/summary",
        files=files if files else None,
        data=data,
        headers=headers,
        timeout=360,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        logger.error(
            f"Unable to process file ${file_path} during summary generation. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process file!")


def extract_summary_of_summaries(api_token: str, summaries: List[str], prompt: str):

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"summaries": summaries, "prompt": prompt}

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/summary-of-summaries",
        json=data,
        headers=headers,
        timeout=360,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        logger.error(
            f"Unable to process files during summary of summaries generation. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process file!")


def highlight_sentences_in_pdf(api_token, sentences, file_path, output_path):
    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"sentences": json.dumps(sentences)}
    files = {}

    if file_path:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file at {file_path} does not exist.")

        file = open(file_path, "rb")
        files["file"] = (os.path.basename(file_path), file)

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/highlight-pdf",
        files=files,
        data=data,
        headers=headers,
        timeout=360,
    )

    # Check the response status code
    if response.status_code == 200:
        # Save the response content (highlighted PDF) to the specified output path
        with open(output_path, "wb") as output_file:
            output_file.write(response.content)

    else:
        logger.error(
            f"Unable to process file ${file_path} during highlight sentences in pdf. It returned {response.status_code} code: {response.text}"
        )
        raise Exception(f"Unable to process file!")


def extract_file_segmentation(api_token, file_path=None, pdf_content=None):

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {}
    files = {}

    if file_path:
        if not os.path.isfile(file_path):
            raise FileNotFoundError(f"The file at {file_path} does not exist.")

        file = open(file_path, "rb")
        files["file"] = (os.path.basename(file_path), file)

    elif pdf_content:
        data["pdf_content"] = json.dumps(pdf_content)

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/file/segment",
        files=files if files else None,
        data=data,
        headers=headers,
        timeout=360,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        logger.error(
            f"Unable to process file ${file_path} during file segmentation. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process file!")


def chat_query(api_token, query, docs):

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"query": query, "docs": docs}
    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/chat",
        json=data,
        headers=headers,
        timeout=360,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        logger.error(
            f"Unable to process user query in the chat. It returned {response.status_code} code: {response.text}"
        )
        raise Exception("Unable to process user query!")


def get_user_usage_data(api_token: str):
    url = f"{settings.pandaetl_server_url}/v1/user/usage"

    # Prepare the headers with the Bearer token
    headers = {"x-authorization": f"Bearer {api_token}"}

    response = requests.post(url, headers=headers)

    if response.status_code not in [200, 201]:
        logger.error(
            f"Failed to fetch usage data. It returned {response.status_code} code: {response.text}"
        )
        raise Exception(f"Failed to fetch usage data")

    try:
        return response.json()
    except requests.exceptions.JSONDecodeError:
        logger.error(f"Invalid JSON response from API server: {response.text}")
        raise Exception("Invalid JSON response")
