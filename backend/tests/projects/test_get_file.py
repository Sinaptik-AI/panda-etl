import os
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.main import app
from app.repositories import project_repository
from app.models import Asset

# Test client setup
client = TestClient(app)


@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    return MagicMock(spec=Session)


@patch("app.repositories.project_repository.get_asset")
@patch("app.api.v1.projects.os.path.isfile")
@patch("app.api.v1.projects.FileResponse")
def test_get_file_success(mock_file_response, mock_isfile, mock_get_asset, mock_db):
    """Test successful file retrieval"""
    mock_asset = MagicMock(id=1, path="/fake/path/test.pdf", filename="test.pdf")
    mock_get_asset.return_value = mock_asset
    mock_isfile.return_value = True
    mock_file_response.return_value = MagicMock()

    response = client.get("/v1/projects/1/assets/1")

    assert response.status_code == 200
    args, kwargs = mock_get_asset.call_args
    assert isinstance(args[0], Session)
    assert args[1] == 1

    mock_isfile.assert_called_once_with("/fake/path/test.pdf")
    mock_file_response.assert_called_once_with(
        "/fake/path/test.pdf", media_type="application/pdf", filename="test.pdf"
    )


@patch("app.repositories.project_repository.get_asset")
def test_get_file_not_found_in_db(mock_get_asset, mock_db):
    """Test file not found in database"""
    mock_get_asset.return_value = None

    response = client.get("/v1/projects/1/assets/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "File not found in the database"}
    args, kwargs = mock_get_asset.call_args
    assert isinstance(args[0], Session)
    assert args[1] == 999


@patch("app.repositories.project_repository.get_asset")
@patch("app.api.v1.projects.os.path.isfile")
def test_get_file_not_found_on_server(mock_isfile, mock_get_asset, mock_db):
    """Test file found in database but not on server"""
    mock_asset = MagicMock(id=1, path="/fake/path/test.pdf", filename="test.pdf")
    mock_get_asset.return_value = mock_asset
    mock_isfile.return_value = False

    response = client.get("/v1/projects/1/assets/1")

    print(response.json())
    assert response.status_code == 404
    assert response.json() == {"detail": "File not found on server"}
    args, _ = mock_get_asset.call_args
    assert isinstance(args[0], Session)
    assert args[1] == 1
    mock_isfile.assert_called_once_with("/fake/path/test.pdf")


@patch("app.repositories.project_repository.get_asset")
@patch("app.api.v1.projects.os.path.isfile")
def test_get_file_general_exception(mock_isfile, mock_get_asset, mock_db):
    """Test general exception during file retrieval"""
    mock_asset = MagicMock(id=1, path="/fake/path/test.pdf", filename="test.pdf")
    mock_get_asset.return_value = mock_asset
    mock_isfile.side_effect = Exception("Unexpected error")

    response = client.get("/v1/projects/1/assets/1")

    assert response.status_code == 500
    assert response.json() == {"detail": "Failed to retrieve file"}
    args, _ = mock_get_asset.call_args
    assert isinstance(args[0], Session)
    assert args[1] == 1
    mock_isfile.assert_called_once_with("/fake/path/test.pdf")
