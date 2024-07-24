import json
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


def extract_data(api_token, file_path, fields):
    fields_data = fields if isinstance(fields, str) else json.dumps(fields)

    # Prepare the headers with the Bearer token
    headers = {"Authorization": f"Bearer {api_token}"}

    with open(file_path, "rb") as file:
        files = {"file": (file_path, file)}
        data = {"fields": fields_data}

        response = requests.post(
            f"{settings.bambooetl_server_url}/v1/extract",
            files=files,
            data=data,
            headers=headers,
            timeout=300,
        )
        # Check the response status code
        if response.status_code == 201 or response.status_code == 200:
            return response.json()
        else:
            raise Exception("Unable to process file!")
