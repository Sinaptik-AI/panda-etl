from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.main import app
from app.api.v1.extract import GetFieldDescriptionRequest
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


@pytest.fixture
def field_description_request():
    """Fixture to provide mock GetFieldDescriptionRequest"""
    return GetFieldDescriptionRequest(fields=["name1", "name2"])


@patch("app.repositories.project_repository.get_project")
@patch("app.api.v1.extract.extract_field_descriptions")
@patch("app.repositories.user_repository.get_user_api_key")
def test_get_field_descriptions_success(
    mock_get_user_api_key,
    mock_extract_field_descriptions,
    mock_get_project,
    field_description_request,
    mock_db,
):
    """Test successful retrieval of field descriptions"""
    mock_project = MagicMock(id=1)
    mock_get_project.return_value = mock_project
    mock_get_user_api_key.return_value = MagicMock(key="fake_api_key")
    mock_extract_field_descriptions.return_value = {
        "field1": "description1",
        "field2": "description2",
    }

    response = client.post(
        f"/v1/extract/1/field-descriptions", json=field_description_request.dict()
    )

    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "File processed successfully",
        "data": {"field1": "description1", "field2": "description2"},
    }

    mock_get_project.assert_called_once_with(db=mock_db, project_id=1)
    mock_get_user_api_key.assert_called_once_with(mock_db)
    mock_extract_field_descriptions.assert_called_once_with(
        api_token="fake_api_key", fields=field_description_request.fields
    )


@patch("app.repositories.project_repository.get_project")
def test_get_field_descriptions_project_not_found(
    mock_get_project, field_description_request, mock_db
):
    """Test retrieval of field descriptions when project does not exist"""
    mock_get_project.return_value = None

    response = client.post(
        f"/v1/extract/1/field-descriptions", json=field_description_request.dict()
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Project doesn't exists"}

    mock_get_project.assert_called_once_with(db=mock_db, project_id=1)
    mock_db.commit.assert_not_called()


@patch("app.repositories.project_repository.get_project")
@patch("app.api.v1.extract.extract_field_descriptions")
@patch("app.repositories.user_repository.get_user_api_key")
def test_get_field_descriptions_exception(
    mock_get_user_api_key,
    mock_extract_field_descriptions,
    mock_get_project,
    field_description_request,
    mock_db,
):
    """Test retrieval of field descriptions when an exception occurs"""
    mock_project = MagicMock(id=1)
    mock_get_project.return_value = mock_project
    mock_get_user_api_key.return_value = MagicMock(key="fake_api_key")
    mock_extract_field_descriptions.side_effect = Exception("Unexpected error")

    response = client.post(
        f"/v1/extract/1/field-descriptions", json=field_description_request.dict()
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Unable to fetch AI Field Descriptions"}

    mock_get_project.assert_called_once_with(db=mock_db, project_id=1)
    mock_get_user_api_key.assert_called_once_with(mock_db)

    assert mock_extract_field_descriptions.call_count == 3
    mock_extract_field_descriptions.assert_called_with(
        api_token="fake_api_key", fields=field_description_request.fields
    )
