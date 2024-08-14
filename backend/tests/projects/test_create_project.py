from unittest.mock import MagicMock, patch
import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.api.v1.projects import create_project
from app.schemas.project import ProjectCreate
from app.repositories import project_repository


# Test client setup
client = TestClient(app)


@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    return MagicMock(spec=Session)


# Mock the project_repository.create_project globally
@patch("app.repositories.project_repository.create_project")
def test_create_project_success(mock_create_project, mock_db):
    """Test project creation success scenario"""
    project_data = ProjectCreate(name="New Project")

    mock_create_project.return_value = {"id": 1, "name": "New Project"}

    response = create_project(project=project_data, db=mock_db)

    assert response["status"] == "success"
    assert response["message"] == "Project created successfully"
    assert response["data"] == {"id": 1, "name": "New Project"}
    mock_create_project.assert_called_once_with(db=mock_db, project=project_data)


def test_create_project_empty_name(mock_db):
    """Test project creation with an empty name"""
    project_data = ProjectCreate(name="")

    with pytest.raises(HTTPException) as excinfo:
        create_project(project=project_data, db=mock_db)

    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == "Project title is required"


def test_create_project_whitespace_name(mock_db):
    """Test project creation with a whitespace name"""
    project_data = ProjectCreate(name="   ")

    with pytest.raises(HTTPException) as excinfo:
        create_project(project=project_data, db=mock_db)

    assert excinfo.value.status_code == 400
    assert excinfo.value.detail == "Project title is required"


@patch("app.repositories.project_repository.create_project")
def test_create_project_db_error(mock_create_project, mock_db):
    """Test project creation when a database error occurs"""
    project_data = ProjectCreate(name="New Project")

    mock_create_project.side_effect = Exception("Database error")

    with pytest.raises(Exception) as excinfo:
        create_project(project=project_data, db=mock_db)

    assert str(excinfo.value) == "Database error"


# Integration Test
@patch("app.repositories.project_repository.create_project")
def test_create_project_api_success(mock_create_project):
    """Test project creation success via API"""
    mock_create_project.return_value = {"id": 1, "name": "New Project"}

    response = client.post("/v1/projects/", json={"name": "New Project"})

    assert response.status_code == 201
    assert response.json() == {
        "status": "success",
        "message": "Project created successfully",
        "data": {"id": 1, "name": "New Project"},
    }


def test_create_project_api_empty_name():
    """Test project creation with an empty name via API"""
    response = client.post("/v1/projects/", json={"name": ""})

    assert response.status_code == 400
    assert response.json() == {"detail": "Project title is required"}


def test_create_project_api_whitespace_name():
    """Test project creation with a whitespace name via API"""
    response = client.post("/v1/projects/", json={"name": "   "})

    assert response.status_code == 400
    assert response.json() == {"detail": "Project title is required"}
