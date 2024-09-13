from unittest.mock import MagicMock, patch
import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session
from fastapi.testclient import TestClient

from app.main import app
from app.api.v1.projects import update_project
from app.schemas.project import ProjectUpdate

client = TestClient(app)


@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    return MagicMock(spec=Session)


@patch("app.repositories.project_repository.update_project")
@patch("app.repositories.project_repository.get_project")
def test_update_project_success(mock_get_project, mock_update_project, mock_db):
    """Test project update success scenario"""
    project_id = 1
    project_data = ProjectUpdate(name="Updated Project", description="New description")

    mock_get_project.return_value = MagicMock()
    mock_update_project.return_value = {
        "id": project_id,
        "name": "Updated Project",
        "description": "New description",
    }

    response = update_project(id=project_id, project=project_data, db=mock_db)

    assert response["status"] == "success"
    assert response["message"] == "Project updated successfully"
    assert response["data"] == {
        "id": project_id,
        "name": "Updated Project",
        "description": "New description",
    }
    mock_update_project.assert_called_once_with(
        db=mock_db, project_id=project_id, project=project_data
    )


@patch("app.repositories.project_repository.get_project")
def test_update_project_not_found(mock_get_project, mock_db):
    """Test project update when project is not found"""
    project_id = 999
    project_data = ProjectUpdate(name="Updated Project")

    mock_get_project.return_value = None

    with pytest.raises(HTTPException) as excinfo:
        update_project(id=project_id, project=project_data, db=mock_db)

    assert excinfo.value.status_code == 404
    assert excinfo.value.detail == "Project not found"


@patch("app.repositories.project_repository.update_project")
@patch("app.repositories.project_repository.get_project")
def test_update_project_db_error(mock_get_project, mock_update_project, mock_db):
    """Test project update when a database error occurs"""
    project_id = 1
    project_data = ProjectUpdate(name="Updated Project")

    mock_get_project.return_value = MagicMock()
    mock_update_project.side_effect = Exception("Database error")

    with pytest.raises(HTTPException) as excinfo:
        update_project(id=project_id, project=project_data, db=mock_db)

    assert excinfo.value.status_code == 500
    assert excinfo.value.detail == "Unable to process request!"


# Integration Test
@patch("app.repositories.project_repository.update_project")
@patch("app.repositories.project_repository.get_project")
def test_update_project_api_success(mock_get_project, mock_update_project):
    """Test project update success via API"""
    project_id = 1
    mock_get_project.return_value = MagicMock()
    mock_update_project.return_value = {
        "id": project_id,
        "name": "Updated Project",
        "description": "New description",
    }

    response = client.put(
        f"/v1/projects/{project_id}",
        json={"name": "Updated Project", "description": "New description"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Project updated successfully",
        "data": {
            "id": project_id,
            "name": "Updated Project",
            "description": "New description",
        },
    }


@patch("app.repositories.project_repository.get_project")
def test_update_project_api_not_found(mock_get_project):
    """Test project update when project is not found via API"""
    project_id = 999
    mock_get_project.return_value = None
    response = client.put(
        f"/v1/projects/{project_id}", json={"name": "Updated Project"}
    )
    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}


@patch("app.repositories.project_repository.get_project")
def test_update_project_api_db_error(mock_get_project):
    """Test project update when a database error occurs via API"""
    project_id = 1
    mock_get_project.side_effect = Exception("Database error")

    response = client.put(
        f"/v1/projects/{project_id}", json={"name": "Updated Project"}
    )

    assert response.status_code == 500
    assert response.json() == {"detail": "Unable to process request!"}
