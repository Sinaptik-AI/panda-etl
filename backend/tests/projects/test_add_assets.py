import os
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import UploadFile
from io import BytesIO

from app.main import app
from app.config import settings
from app.database import get_db

# Test client setup
client = TestClient(app)


@pytest.fixture
def mock_file():
    """Fixture to mock an uploaded PDF file"""
    file_content = BytesIO(b"Dummy PDF content")
    return UploadFile(filename="test.pdf", file=file_content)


@pytest.fixture
def mock_non_pdf_file():
    """Fixture to mock an uploaded non-PDF file"""
    file_content = BytesIO(b"Dummy non-PDF content")
    return UploadFile(filename="test.txt", file=file_content)


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
@patch("app.api.v1.projects.open")
@patch("app.api.v1.projects.os.makedirs")
@patch("app.api.v1.projects.os.path")
@patch("app.api.v1.projects.process_file")
def test_upload_files_success(
    mock_preprocess_file,
    mock_os_path,
    mock_makedirs,
    mock_open,
    mock_get_project,
    mock_file,
    mock_db,
):
    """Test uploading files successfully"""
    mock_get_project.return_value = MagicMock(id=1)
    mock_open.return_value.__enter__.return_value.write = MagicMock()
    mock_os_path.normcase.return_value = "normalized/path"
    mock_os_path.join.return_value = "joined/path"

    response = client.post(
        "/v1/projects/1/assets",
        files={"files": ("test.pdf", mock_file.file, "application/pdf")},
    )

    assert response.status_code == 200
    assert response.json() == "Successfully uploaded the files"

    # Check if the file was saved
    mock_open.assert_called_once_with(
        os.path.join(settings.upload_dir, "1", "test.pdf"), "wb"
    )


@patch("app.repositories.project_repository.get_project")
def test_upload_files_project_not_found(mock_get_project, mock_file, mock_db):
    """Test uploading files when project is not found"""
    mock_get_project.return_value = None

    response = client.post(
        "/v1/projects/1/assets",
        files={"files": ("test.pdf", mock_file.file, "application/pdf")},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "The specified project could not be found."}


@patch("app.repositories.project_repository.get_project")
def test_upload_files_non_pdf(mock_get_project, mock_non_pdf_file, mock_db):
    """Test uploading a non-PDF file"""
    mock_get_project.return_value = MagicMock(id=1)

    response = client.post(
        "/v1/projects/1/assets",
        files={"files": ("test.txt", mock_non_pdf_file.file, "application/txt")},
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "The file 'test.txt' is not a valid PDF. Please upload only PDF files."}
