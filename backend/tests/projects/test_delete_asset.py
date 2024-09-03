from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.main import app
from app.repositories import project_repository
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


@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_asset")
@patch("app.api.v1.projects.ChromaDB")
def test_delete_asset_success(mock_chroma, mock_get_asset, mock_get_project, mock_db):
    """Test successful deletion of an asset"""
    mock_project = MagicMock(id=1, deleted_at=None)
    mock_get_project.return_value = mock_project

    mock_asset = MagicMock(id=1, deleted_at=None)
    mock_get_asset.return_value = mock_asset

    response = client.delete("/v1/projects/1/assets/1")

    assert response.status_code == 200
    assert response.json() == {"message": "Asset deleted successfully"}

    # Ensure the asset was soft deleted
    assert mock_asset.deleted_at is not None
    mock_db.commit.assert_called_once()

    mock_get_project.assert_called_once_with(mock_db, 1)
    mock_get_asset.assert_called_once_with(mock_db, 1)


@patch("app.repositories.project_repository.get_project")
def test_delete_asset_project_not_found(mock_get_project, mock_db):
    """Test deletion when project is not found"""
    mock_get_project.return_value = None

    response = client.delete("/v1/projects/999/assets/1")

    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}

    mock_get_project.assert_called_once_with(mock_db, 999)
    mock_db.commit.assert_not_called()


@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_asset")
def test_delete_asset_not_found(mock_get_asset, mock_get_project, mock_db):
    """Test deletion when asset is not found"""
    mock_project = MagicMock(id=1, deleted_at=None)
    mock_get_project.return_value = mock_project

    mock_get_asset.return_value = None

    response = client.delete("/v1/projects/1/assets/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "File not found in the database"}

    mock_get_project.assert_called_once_with(mock_db, 1)
    mock_get_asset.assert_called_once_with(mock_db, 999)
    mock_db.commit.assert_not_called()


@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_asset")
@patch("app.api.v1.projects.ChromaDB")
def test_delete_asset_db_error(mock_chroma, mock_get_asset, mock_get_project, mock_db):
    """Test deletion when a database error occurs"""
    mock_project = MagicMock(id=1, deleted_at=None)
    mock_get_project.return_value = mock_project

    mock_asset = MagicMock(id=1, deleted_at=None)
    mock_get_asset.return_value = mock_asset

    mock_db.commit.side_effect = Exception("Database error")

    response = client.delete("/v1/projects/1/assets/1")

    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to retrieve file"}

    mock_get_project.assert_called_once_with(mock_db, 1)
    mock_get_asset.assert_called_once_with(mock_db, 1)
    mock_db.commit.assert_called_once()
