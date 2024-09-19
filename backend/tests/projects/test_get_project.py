from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException

from app.main import app
from app.repositories import project_repository
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


@patch("app.repositories.project_repository.get_project")
def test_get_project_success(mock_get_project, mock_db):
    """Test getting a project successfully"""
    # Mock data returned by the repository
    mock_project = create_mock_project(
        id=1,
        name="Project 1",
        description="Description 1",
        created_at=datetime(2023, 8, 10, 10, 0, 0),
        updated_at=datetime(2023, 8, 10, 12, 0, 0),
    )
    mock_get_project.return_value = mock_project

    response = client.get("/v1/projects/1")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Project successfully returned",
        "data": {
            "id": 1,
            "name": "Project 1",
            "description": "Description 1",
            "created_at": "2023-08-10T10:00:00",
            "updated_at": "2023-08-10T12:00:00",
        },
    }

    # Check that the correct parameters were passed, and that db is an instance of Session
    _, kwargs = mock_get_project.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1


@patch("app.repositories.project_repository.get_project")
def test_get_project_not_found(mock_get_project, mock_db):
    """Test getting a project that does not exist"""
    mock_get_project.return_value = None

    response = client.get("/v1/projects/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}

    # Check that the correct parameters were passed, and that db is an instance of Session
    _, kwargs = mock_get_project.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 999


@patch("app.repositories.project_repository.get_project")
def test_get_project_db_error(mock_get_project, mock_db):
    """Test getting a project when a database error occurs"""
    mock_get_project.side_effect = Exception("Database error")

    response = client.get("/v1/projects/1")

    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process request!"}

    # Check that the correct parameters were passed, and that db is an instance of Session
    _, kwargs = mock_get_project.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1
