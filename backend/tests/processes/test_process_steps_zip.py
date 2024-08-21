from unittest.mock import patch, MagicMock, mock_open
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
import pytest
from io import BytesIO

from app.database import get_db

# Test client setup
client = TestClient(app)


# Mock the get_db dependency
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


@patch("app.repositories.process_repository.get_process")
@patch("app.repositories.process_repository.get_process_steps")
def test_download_process_steps_zip_success(
    mock_get_process_steps, mock_get_process, mock_db
):
    """Test successful downloading of highlighted PDFs as a zip"""

    # Mock process and steps
    mock_process = MagicMock(id=1, type="extractive_summary", deleted_at=None)
    mock_get_process.return_value = mock_process

    mock_step = MagicMock(output={"highlighted_pdf": "path/to/highlighted.pdf"})
    mock_get_process_steps.return_value = [mock_step]

    # Mock the open function to simulate reading a PDF file
    with patch("builtins.open", mock_open(read_data=b"mock content")) as mock_file:
        response = client.get("/v1/processes/1/download-highlighted-pdf-zip")

        assert response.status_code == 200
        assert (
            response.headers["Content-Disposition"]
            == "attachment; filename=highlighted_pdfs_1.zip"
        )
        assert response.headers["Content-Type"] == "application/zip"

        # Ensure the mocked functions were called
        mock_get_process.assert_called_once_with(db=mock_db, process_id=1)
        mock_get_process_steps.assert_called_once_with(mock_db, 1)
        assert mock_file.call_args[0][0] == "path/to/highlighted.pdf"
        assert mock_file.call_args[0][1] == "rb"


@patch("app.repositories.process_repository.get_process")
def test_download_process_steps_zip_no_process(mock_get_process, mock_db):
    """Test case where no process is found"""

    mock_get_process.return_value = None

    response = client.get("/v1/processes/999/download-highlighted-pdf-zip")

    assert response.status_code == 404
    assert response.json() == {"detail": "No process found!"}

    mock_get_process.assert_called_once_with(db=mock_db, process_id=999)


@patch("app.repositories.process_repository.get_process")
def test_download_process_steps_zip_wrong_process_type(mock_get_process, mock_db):
    """Test case where process is not of type 'extractive_summary'"""

    mock_process = MagicMock(id=1, type="different_type")
    mock_get_process.return_value = mock_process

    response = client.get("/v1/processes/1/download-highlighted-pdf-zip")

    assert response.status_code == 404
    assert response.json() == {"detail": "No highlighted pdf found!"}

    mock_get_process.assert_called_once_with(db=mock_db, process_id=1)


@patch("app.repositories.process_repository.get_process")
@patch("app.repositories.process_repository.get_process_steps")
def test_download_process_steps_zip_no_steps(
    mock_get_process_steps, mock_get_process, mock_db
):
    """Test case where no process steps are found"""

    mock_process = MagicMock(id=1, type="extractive_summary")
    mock_get_process.return_value = mock_process
    mock_get_process_steps.return_value = []

    response = client.get("/v1/processes/1/download-highlighted-pdf-zip")

    assert response.status_code == 404
    assert response.json() == {"detail": "No process steps found!"}

    mock_get_process.assert_called_once_with(db=mock_db, process_id=1)
    mock_get_process_steps.assert_called_once_with(mock_db, 1)


@patch("app.repositories.process_repository.get_process")
@patch("app.repositories.process_repository.get_process_steps")
def test_download_process_steps_zip_no_highlighted_pdfs(
    mock_get_process_steps, mock_get_process, mock_db
):
    """Test case where no highlighted PDFs exist for any step"""

    mock_process = MagicMock(id=1, type="extractive_summary")
    mock_get_process.return_value = mock_process
    mock_step = MagicMock(output={})  # No highlighted_pdf key in the output
    mock_get_process_steps.return_value = [mock_step]

    response = client.get("/v1/processes/1/download-highlighted-pdf-zip")

    assert response.status_code == 404
    assert response.json() == {"detail": "No Highlighted pdf's exists!"}

    mock_get_process.assert_called_once_with(db=mock_db, process_id=1)
    mock_get_process_steps.assert_called_once_with(mock_db, 1)
