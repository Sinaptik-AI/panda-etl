from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.repositories import project_repository
from app.models import Asset, Process
from app.database import get_db

# Test client setup
client = TestClient(app)


# Mock get_db dependency
@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    db = MagicMock(spec=Session)
    return db


@pytest.fixture(autouse=True)
def override_get_db(mock_db):
    """Override the get_db dependency with the mock"""

    def _override_get_db():
        return mock_db

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


@patch("app.repositories.project_repository.delete_processes_and_steps")
@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_assets")
def test_delete_project_success(
    mock_get_assets, mock_get_project, mock_delete_process_steps, mock_db
):
    """Test successful deletion of a project and its associated assets"""
    # Mock project and assets
    mock_project = MagicMock(id=1, deleted_at=None)
    mock_get_project.return_value = mock_project
    mock_asset = MagicMock(id=1, deleted_at=None)
    mock_get_assets.return_value = ([mock_asset], 1)

    response = client.delete("/v1/projects/1")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Project and associated assets deleted successfully"
    }

    # Ensure the project was soft deleted
    assert mock_project.deleted_at is not None
    mock_db.commit.assert_called()

    # Ensure the associated assets were soft deleted
    assert mock_asset.deleted_at is not None
    mock_db.commit.assert_called()

    # Ensure delete_process_steps was called
    mock_delete_process_steps.assert_called_once_with(mock_db, mock_project.id)

    mock_get_project.assert_called_once_with(mock_db, 1)
    mock_get_assets.assert_called_once_with(mock_db, 1)


@patch("app.repositories.project_repository.delete_processes_and_steps")
@patch("app.repositories.project_repository.get_project")
def test_delete_project_not_found(mock_get_project, mock_delete_process_steps, mock_db):
    """Test deletion when project is not found"""
    mock_get_project.return_value = None

    response = client.delete("/v1/projects/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}

    mock_get_project.assert_called_once_with(mock_db, 999)
    mock_delete_process_steps.assert_not_called()
    mock_db.commit.assert_not_called()


@patch("app.repositories.project_repository.delete_processes_and_steps")
@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_assets")
def test_delete_project_db_error(
    mock_get_assets, mock_get_project, mock_delete_process_steps, mock_db
):
    """Test deletion when a database error occurs"""
    mock_project = MagicMock(id=1, deleted_at=None)
    mock_get_project.return_value = mock_project
    mock_get_assets.side_effect = Exception("Database error")

    response = client.delete("/v1/projects/1")

    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to delete!"}

    mock_get_project.assert_called_once_with(mock_db, 1)
    mock_get_assets.assert_called_once_with(mock_db, 1)
    mock_delete_process_steps.assert_not_called()
    mock_db.commit.assert_not_called()


@patch("app.repositories.project_repository.delete_processes_and_steps")
@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_assets")
def test_delete_project_process_steps_failure(
    mock_get_assets, mock_get_project, mock_delete_process_steps, mock_db
):
    """Test deletion when delete_process_steps fails"""
    # Mock project and assets
    mock_project = MagicMock(id=1, deleted_at=None)
    mock_get_project.return_value = mock_project
    mock_asset = MagicMock(id=1, deleted_at=None)
    mock_get_assets.return_value = ([mock_asset], 1)

    # Simulate delete_process_steps raising an exception
    mock_delete_process_steps.side_effect = Exception("Process steps deletion failed")

    response = client.delete("/v1/projects/1")

    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to delete!"}

    mock_get_project.assert_called_once_with(mock_db, 1)
    mock_get_assets.assert_called_once_with(mock_db, 1)
    mock_delete_process_steps.assert_called_once_with(mock_db, 1)
    mock_db.commit.assert_not_called()
