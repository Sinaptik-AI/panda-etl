import json
import os
from typing import List
import requests
from app.config import settings


def request_api_key(email: str):
    url = f"{settings.api_server_url}/api/auth/register-pandaetl"

    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json={"email": email}, headers=headers)

    if response.status_code not in [200, 201]:
        raise Exception(
            f"Failed to request API: {response.status_code} - {response.text}"
        )

    try:
        data = response.json()
    except requests.exceptions.JSONDecodeError:
        raise Exception("Invalid JSON response")

    return data.get("message", "No message in response")


def extract_text_from_file(api_token: str, file_path: str, type: str):
    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}
    files = {}
    file = open(file_path, "rb")
    files["file"] = (os.path.basename(file_path), file)

    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/file/content",
        files=files,
        headers=headers,
        timeout=3600,
    )

    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")


def extract_data(api_token, fields, file_path=None, pdf_content=None):
    fields_data = fields if isinstance(fields, str) else json.dumps(fields)

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

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
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")


def extract_field_descriptions(api_token, fields):

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"fields": fields}

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/field-descriptions",
        json=data,
        headers=headers,
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")


def extract_summary(api_token, config, file_path=None, pdf_content=None):
    config_data = config if isinstance(config, str) else json.dumps(config)
    pdf_content_data = (
        config if isinstance(pdf_content, str) else json.dumps(pdf_content)
    )

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

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
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")


def extract_summary_of_summaries(api_token: str, summaries: List[str], prompt: str):

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"summaries": summaries, "prompt": prompt}

    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/extract/summary-of-summaries",
        json=data,
        headers=headers,
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")


def highlight_sentences_in_pdf(api_token, sentences, file_path, output_path):
    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

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
        timeout=3600,
    )

    # Check the response status code
    if response.status_code == 200:
        # Save the response content (highlighted PDF) to the specified output path
        with open(output_path, "wb") as output_file:
            output_file.write(response.content)

    else:
        raise Exception(
            f"Unable to process file! Status code: {response.status_code}, Response: {response.text}"
        )


def extract_file_segmentation(api_token, file_path=None, pdf_content=None):

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

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
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")


def chat_query(api_token, query, docs):

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

    # Prepare the data and files dictionaries
    data = {"query": query, "docs": docs}
    # Send the request
    response = requests.post(
        f"{settings.pandaetl_server_url}/v1/chat",
        json=data,
        headers=headers,
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process user query!")
