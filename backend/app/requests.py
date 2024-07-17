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
