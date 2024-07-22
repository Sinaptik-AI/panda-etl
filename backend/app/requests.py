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


def extract_data(file_path):
    with open(file_path, "rb") as file:
        files = {"file": (file_path, file)}

        response = requests.post("http://localhost:5328/v1/extract", files=files)

        # Check the response status code
        if response.status_code == 201:
            return response.json()
        else:
            raise Exception("Unable to process file!")
