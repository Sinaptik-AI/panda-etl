from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app

# Test client setup
client = TestClient(app)


@pytest.fixture
def mock_db():
    """Fixture to mock the database session"""
    return MagicMock(spec=Session)


@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_processes")
def test_get_processes_success(mock_get_processes, mock_get_project, mock_db):
    """Test successful retrieval of processes"""
    # Mock project and processes
    mock_get_project.return_value = MagicMock(id=1, name="Test Project")
    mock_process_1 = MagicMock(
        id=1,
        name="Process 1",
        type="type1",
        status="completed",
        project_id=1,
        details="Some details",
        started_at="2023-08-13T10:00:00Z",
        completed_at="2023-08-13T12:00:00Z",
        created_at="2023-08-13T08:00:00Z",
        updated_at="2023-08-13T13:00:00Z",
    )
    mock_process_2 = MagicMock(
        id=2,
        name="Process 2",
        type="type2",
        status="in-progress",
        project_id=1,
        details="More details",
        started_at="2023-08-13T10:00:00Z",
        completed_at=None,
        created_at="2023-08-13T08:00:00Z",
        updated_at="2023-08-13T13:00:00Z",
    )
    mock_get_processes.return_value = [(mock_process_1, 10), (mock_process_2, 5)]

    response = client.get("/v1/projects/1/processes")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Processes successfully returned",
        "data": [
            {
                "id": 1,
                "name": {},
                "type": "type1",
                "status": "completed",
                "project_id": "1",
                "details": "Some details",
                "started_at": "2023-08-13T10:00:00Z",
                "completed_at": "2023-08-13T12:00:00Z",
                "created_at": "2023-08-13T08:00:00Z",
                "updated_at": "2023-08-13T13:00:00Z",
                "completed_step_count": 10,
            },
            {
                "id": 2,
                "name": {},
                "type": "type2",
                "status": "in-progress",
                "project_id": "1",
                "details": "More details",
                "started_at": "2023-08-13T10:00:00Z",
                "completed_at": None,
                "created_at": "2023-08-13T08:00:00Z",
                "updated_at": "2023-08-13T13:00:00Z",
                "completed_step_count": 5,
            },
        ],
    }
    _, kwargs = mock_get_project.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1

    _, kwargs = mock_get_processes.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1


@patch("app.repositories.project_repository.get_project")
def test_get_processes_project_not_found(mock_get_project, mock_db):
    """Test retrieval of processes when project is not found"""
    mock_get_project.return_value = None

    response = client.get("/v1/projects/999/processes")

    print(response.json())
    assert response.status_code == 404
    assert response.json() == {"detail": "Project not found"}

    _, kwargs = mock_get_project.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 999


@patch("app.repositories.project_repository.get_project")
@patch("app.repositories.project_repository.get_processes")
def test_get_processes_no_processes(mock_get_processes, mock_get_project, mock_db):
    """Test retrieval of processes when no processes are found"""
    mock_get_project.return_value = MagicMock(id=1, name="Test Project")
    mock_get_processes.return_value = []

    response = client.get("/v1/projects/1/processes")

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Processes successfully returned",
        "data": [],
    }
    _, kwargs = mock_get_project.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1

    _, kwargs = mock_get_processes.call_args
    assert isinstance(kwargs["db"], Session)
    assert kwargs["project_id"] == 1
