from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime

from app.main import app
from app.models import Project  # Import your Project model

# Test client setup
client = TestClient(app)


@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    return MagicMock(spec=Session)


def create_mock_project(
    id: int, name: str, description: str, created_at: datetime, updated_at: datetime
) -> Project:
    """Helper function to create a mock Project object"""
    project = MagicMock(spec=Project)
    project.id = id
    project.name = name
    project.description = description
    project.created_at = created_at
    project.updated_at = updated_at
    return project


@patch("app.repositories.project_repository.get_projects")
def test_get_projects_success(mock_get_projects, mock_db):
    """Test getting projects successfully"""
    # Mock data returned by the repository
    mock_projects = [
        (
            create_mock_project(
                id=1,
                name="Project 1",
                description="Description 1",
                created_at=datetime(2023, 8, 10, 10, 0, 0),
                updated_at=datetime(2023, 8, 10, 12, 0, 0),
            ),
            1,
        ),
        (
            create_mock_project(
                id=2,
                name="Project 2",
                description="Description 2",
                created_at=datetime(2023, 8, 11, 11, 0, 0),
                updated_at=datetime(2023, 8, 11, 13, 0, 0),
            ),
            1,
        ),
    ]
    total_count = 2
    mock_get_projects.return_value = (mock_projects, total_count)

    response = client.get("/v1/projects/?page=1&page_size=2")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Projects successfully returned",
        "data": [
            {
                "id": 1,
                "name": "Project 1",
                "description": "Description 1",
                "created_at": "2023-08-10T10:00:00",
                "updated_at": "2023-08-10T12:00:00",
                "asset_count": 1,
            },
            {
                "id": 2,
                "name": "Project 2",
                "description": "Description 2",
                "created_at": "2023-08-11T11:00:00",
                "updated_at": "2023-08-11T13:00:00",
                "asset_count": 1,
            },
        ],
        "total_count": total_count,
        "page": 1,
        "page_size": 2,
    }

    _, kwargs = mock_get_projects.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["page"] == 1
    assert kwargs["page_size"] == 2


@patch("app.repositories.project_repository.get_projects")
def test_get_projects_empty(mock_get_projects, mock_db):
    """Test getting projects when no projects exist"""
    mock_get_projects.return_value = ([], 0)

    response = client.get("/v1/projects?page=1&page_size=2")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Projects successfully returned",
        "data": [],
        "total_count": 0,
        "page": 1,
        "page_size": 2,
    }
    _, kwargs = mock_get_projects.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["page"] == 1
    assert kwargs["page_size"] == 2


def test_get_projects_invalid_page():
    """Test getting projects with an invalid page number"""
    response = client.get("/v1/projects?page=0&page_size=2")

    assert response.status_code == 422
    assert (
        "Input should be greater than or equal to 1"
        in response.json()["detail"][0]["msg"]
    )


def test_get_projects_invalid_page_size():
    """Test getting projects with an invalid page size"""
    response = client.get("/v1/projects?page=1&page_size=101")

    assert response.status_code == 422
    assert (
        "Input should be less than or equal to 100"
        in response.json()["detail"][0]["msg"]
    )


@patch("app.repositories.project_repository.get_projects")
def test_get_projects_db_error(mock_get_projects, mock_db):
    """Test getting projects when a database error occurs"""
    mock_get_projects.side_effect = Exception("Database error")

    response = client.get("/v1/projects?page=1&page_size=2")

    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process request!"}
    _, kwargs = mock_get_projects.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["page"] == 1
    assert kwargs["page_size"] == 2
