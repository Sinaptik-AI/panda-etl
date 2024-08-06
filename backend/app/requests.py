import json
import os
import requests
from app.config import settings


def request_api_key(email: str):
    url = f"{settings.api_server_url}/api/auth/register-bambooetl"

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


def extract_text_from_pdf(api_token, file_path):
    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}
    files = {}
    file = open(file_path, "rb")
    files["file"] = (os.path.basename(file_path), file)

    response = requests.post(
        f"{settings.bambooetl_server_url}/v1/extract/file/content",
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
        f"{settings.bambooetl_server_url}/v1/extract",
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
        f"{settings.bambooetl_server_url}/v1/extract/field-descriptions",
        json=data,
        headers=headers,
        timeout=3600,
    )
    # Check the response status code
    if response.status_code == 201 or response.status_code == 200:
        return response.json()
    else:
        raise Exception("Unable to process file!")
