from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from app.main import app
from app.models import Asset  # Import your Asset model

# Test client setup
client = TestClient(app)


@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    return MagicMock(spec=Session)


def create_mock_asset(
    id: int,
    filename: str,
    created_at: datetime,
    updated_at: datetime,
    type: str,
    details: dict,
    size: int,
) -> Asset:
    """Helper function to create a mock Asset object"""
    asset = MagicMock(spec=Asset)
    asset.id = id
    asset.filename = filename
    asset.created_at = created_at
    asset.updated_at = updated_at
    asset.type = type
    asset.details = details
    asset.size = size
    return asset


@patch("app.repositories.project_repository.get_assets")
def test_get_assets_success(mock_get_assets, mock_db):
    """Test getting assets successfully"""
    # Mock data returned by the repository
    mock_assets = [
        create_mock_asset(
            id=1,
            filename="asset1.png",
            created_at=datetime(2023, 8, 10, 10, 0, 0),
            updated_at=datetime(2023, 8, 10, 12, 0, 0),
            type="pdf",
            details={},
            size=1,
        ),
        create_mock_asset(
            id=2,
            filename="asset2.png",
            created_at=datetime(2023, 8, 11, 11, 0, 0),
            updated_at=datetime(2023, 8, 11, 13, 0, 0),
            type="pdf",
            details={},
            size=1,
        ),
    ]
    total_count = 2
    mock_get_assets.return_value = (mock_assets, total_count)

    response = client.get("/v1/projects/1/assets?page=1&page_size=2")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Assets successfully returned",
        "data": [
            {
                "id": 1,
                "filename": "asset1.png",
                "created_at": "2023-08-10T10:00:00",
                "updated_at": "2023-08-10T12:00:00",
                "type": "pdf",
                "details": {},
                "size": 1,
            },
            {
                "id": 2,
                "filename": "asset2.png",
                "created_at": "2023-08-11T11:00:00",
                "updated_at": "2023-08-11T13:00:00",
                "type": "pdf",
                "details": {},
                "size": 1,
            },
        ],
        "total_count": total_count,
        "page": 1,
        "page_size": 2,
    }

    # Check that the correct parameters were passed, and that db is an instance of Session
    _, kwargs = mock_get_assets.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1
    assert kwargs["page"] == 1
    assert kwargs["page_size"] == 2
    assert kwargs["order_by"] == "desc"


@patch("app.repositories.project_repository.get_assets")
def test_get_assets_empty(mock_get_assets, mock_db):
    """Test getting assets when none exist"""
    mock_get_assets.return_value = ([], 0)

    response = client.get("/v1/projects/1/assets?page=1&page_size=2")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Assets successfully returned",
        "data": [],
        "total_count": 0,
        "page": 1,
        "page_size": 2,
    }

    # Check that the correct parameters were passed, and that db is an instance of Session
    _, kwargs = mock_get_assets.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1
    assert kwargs["page"] == 1
    assert kwargs["page_size"] == 2
    assert kwargs["order_by"] == "desc"


def test_get_assets_invalid_page():
    """Test getting assets with an invalid page number"""
    response = client.get("/v1/projects/1/assets?page=0&page_size=2")
    assert response.status_code == 422
    assert (
        "Input should be greater than or equal to 1"
        in response.json()["detail"][0]["msg"]
    )


def test_get_assets_invalid_page_size():
    """Test getting assets with an invalid page size"""
    response = client.get("/v1/projects/1/assets?page=1&page_size=101")

    assert response.status_code == 422
    assert (
        "Input should be less than or equal to 1" in response.json()["detail"][0]["msg"]
    )


@patch("app.repositories.project_repository.get_assets")
def test_get_assets_db_error(mock_get_assets, mock_db):
    """Test getting assets when a database error occurs"""
    mock_get_assets.side_effect = Exception("Database error")

    response = client.get("/v1/projects/1/assets?page=1&page_size=2")

    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process request!"}

    # Check that the correct parameters were passed, and that db is an instance of Session
    _, kwargs = mock_get_assets.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1
    assert kwargs["page"] == 1
    assert kwargs["page_size"] == 2
    assert kwargs["order_by"] == "desc"
