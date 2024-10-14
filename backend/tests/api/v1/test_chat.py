from unittest.mock import MagicMock, patch

import pytest
from app.api.v1.chat import group_by_start_end
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


@pytest.fixture
def mock_db():
    return MagicMock()


@pytest.fixture
def mock_vectorstore():
    with patch("app.vectorstore.chroma.ChromaDB") as mock:
        yield mock


@pytest.fixture
def mock_chat_query():
    with patch("app.api.v1.chat.chat_query") as mock:
        yield mock

def test_chat_status_endpoint(mock_db):
    # Arrange
    project_id = 1
    
    with patch("app.repositories.project_repository.get_assets_without_content", return_value=[]):
        with patch("app.repositories.project_repository.get_assets_content_pending", return_value=[]):
            # Act
            response = client.get(f"/v1/chat/project/{project_id}/status")
    
    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["data"]["status"] is True


def test_group_by_start_end():
    # Arrange
    references = [
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source1"],
            "start": 0,
            "end": 10,
        },
        {
            "asset_id": 2,
            "project_id": 1,
            "page_number": 1,
            "filename": "file2.pdf",
            "source": ["source2"],
            "start": 0,
            "end": 10,
        },
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source3"],
            "start": 0,
            "end": 10,
        },
        {
            "asset_id": 3,
            "project_id": 1,
            "page_number": 2,
            "filename": "file3.pdf",
            "source": ["source4"],
            "start": 15,
            "end": 25,
        },
    ]

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 2  # Two groups: (0, 10) and (15, 25)

    # Check first group
    assert result[0]["start"] == 0
    assert result[0]["end"] == 10
    assert len(result[0]["references"]) == 2  # Two unique asset_ids in this group

    # Check that sources for the same asset_id are combined
    for ref in result[0]["references"]:
        if ref["asset_id"] == 1:
            assert ref["source"] == ["source1", "source3"]
        elif ref["asset_id"] == 2:
            assert ref["source"] == ["source2"]

    # Check second group
    assert result[1]["start"] == 15
    assert result[1]["end"] == 25
    assert len(result[1]["references"]) == 1
    assert result[1]["references"][0]["asset_id"] == 3
    assert result[1]["references"][0]["source"] == ["source4"]


def test_group_by_start_end_empty_input():
    # Arrange
    references = []

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 0


def test_group_by_start_end_single_reference():
    # Arrange
    references = [
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source1"],
            "start": 0,
            "end": 10,
        }
    ]

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 1
    assert result[0]["start"] == 0
    assert result[0]["end"] == 10
    assert len(result[0]["references"]) == 1
    assert result[0]["references"][0]["source"] == ["source1"]


def test_group_by_start_end_same_asset_different_pages():
    # Arrange
    references = [
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source1"],
            "start": 0,
            "end": 10,
        },
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 2,
            "filename": "file1.pdf",
            "source": ["source2"],
            "start": 0,
            "end": 10,
        },
    ]

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 1
    assert len(result[0]["references"]) == 2
    assert (
        result[0]["references"][0]["page_number"]
        != result[0]["references"][1]["page_number"]
    )


def test_group_by_start_end_overlapping_ranges():
    # Arrange
    references = [
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source1"],
            "start": 0,
            "end": 10,
        },
        {
            "asset_id": 2,
            "project_id": 1,
            "page_number": 1,
            "filename": "file2.pdf",
            "source": ["source2"],
            "start": 5,
            "end": 15,
        },
    ]

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 2
    assert result[0]["start"] == 0 and result[0]["end"] == 10
    assert result[1]["start"] == 5 and result[1]["end"] == 15


def test_group_by_start_end_non_contiguous_ranges():
    # Arrange
    references = [
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source1"],
            "start": 0,
            "end": 10,
        },
        {
            "asset_id": 2,
            "project_id": 1,
            "page_number": 1,
            "filename": "file2.pdf",
            "source": ["source2"],
            "start": 20,
            "end": 30,
        },
        {
            "asset_id": 3,
            "project_id": 1,
            "page_number": 1,
            "filename": "file3.pdf",
            "source": ["source3"],
            "start": 40,
            "end": 50,
        },
    ]

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 3
    assert result[0]["start"] == 0 and result[0]["end"] == 10
    assert result[1]["start"] == 20 and result[1]["end"] == 30
    assert result[2]["start"] == 40 and result[2]["end"] == 50


def test_group_by_start_end_large_values():
    # Arrange
    references = [
        {
            "asset_id": 1,
            "project_id": 1,
            "page_number": 1,
            "filename": "file1.pdf",
            "source": ["source1"],
            "start": 1000000,
            "end": 1000010,
        },
        {
            "asset_id": 2,
            "project_id": 1,
            "page_number": 1,
            "filename": "file2.pdf",
            "source": ["source2"],
            "start": 1000000,
            "end": 1000010,
        },
    ]

    # Act
    result = group_by_start_end(references)

    # Assert
    assert len(result) == 1
    assert result[0]["start"] == 1000000 and result[0]["end"] == 1000010
    assert len(result[0]["references"]) == 2
