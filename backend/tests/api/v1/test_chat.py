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
    with patch("app.api.v1.chat.ChromaDB") as mock:
        yield mock


@pytest.fixture
def mock_chat_query():
    with patch("app.api.v1.chat.chat_query") as mock:
        yield mock


@pytest.fixture
def mock_user_repository():
    with patch("app.api.v1.chat.user_repository.get_user_api_key") as mock:
        yield mock


@pytest.fixture
def mock_get_users_repository():
    with patch("app.api.v1.chat.user_repository.get_users") as mock:
        yield mock

@pytest.fixture
def mock_conversation_repository():
    with patch("app.api.v1.chat.conversation_repository") as mock:
        yield mock

@pytest.fixture
def mock_get_assets_filename():
    with patch("app.api.v1.chat.project_repository.get_assets_filename") as mock:
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


def test_chat_endpoint_success(mock_db, mock_get_users_repository, mock_vectorstore, mock_chat_query, mock_user_repository, mock_conversation_repository, mock_get_assets_filename):
    # Arrange
    project_id = 1
    chat_request = {
        "query": "Tell me about sustainability.",
        "conversation_id": None
    }

    # Mocking dependencies
    mock_vectorstore.return_value.get_relevant_segments.return_value = (["Quote 1", "Quote 2"], [1, 2], {})
    mock_user_repository.return_value.key = "test_api_key"
    mock_chat_query.return_value = {"response": "Here's a response", "references": []}
    mock_conversation_repository.create_new_conversation.return_value = MagicMock(id=123)
    mock_get_users_repository.return_value = MagicMock(id=1)
    mock_get_assets_filename.return_value = ["file1.pdf", "file2.pdf"]

    # Act
    response = client.post(f"/v1/chat/project/{project_id}", json=chat_request)

    # Assert
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["data"]["conversation_id"] == "123"
    assert response.json()["data"]["response"] == "Here's a response"

def test_chat_endpoint_creates_conversation(mock_db, mock_get_users_repository, mock_vectorstore, mock_chat_query, mock_user_repository, mock_conversation_repository, mock_get_assets_filename):
    # Arrange
    project_id = 1
    chat_request = {
        "query": "What's the latest on climate change?",
        "conversation_id": None
    }

    # Set up mock responses
    mock_vectorstore.return_value.get_relevant_segments.return_value = (["Quote 1"], [1], {})
    mock_user_repository.return_value.key = "test_api_key"
    mock_chat_query.return_value = {"response": "Latest news on climate change", "references": []}

    # Explicitly set the mock to return 456 as the conversation ID
    mock_conversation_repository.create_new_conversation.return_value = MagicMock(id=456)
    mock_get_users_repository.return_value = MagicMock(id=1)
    mock_get_assets_filename.return_value = ["file1.pdf"]

    # Act
    response = client.post(f"/v1/chat/project/{project_id}", json=chat_request)

    # Assert
    assert response.status_code == 200
    assert response.json()["data"]["conversation_id"] == "456"
    assert mock_conversation_repository.create_new_conversation.called

def test_chat_endpoint_error_handling(mock_db, mock_vectorstore, mock_chat_query):
    # Arrange
    project_id = 1
    chat_request = {
        "query": "An error should occur.",
        "conversation_id": None
    }

    mock_vectorstore.return_value.get_relevant_segments.side_effect = Exception("Database error")

    # Act
    response = client.post(f"/v1/chat/project/{project_id}", json=chat_request)

    # Assert
    assert response.status_code == 400
    assert "Unable to process the chat query" in response.json()["detail"]

def test_chat_endpoint_reference_processing(mock_db, mock_get_users_repository, mock_vectorstore, mock_chat_query, mock_user_repository, mock_conversation_repository, mock_get_assets_filename):
    # Arrange
    project_id = 1
    chat_request = {
        "query": "Reference query.",
        "conversation_id": None
    }

    mock_vectorstore.return_value.get_relevant_segments.return_value = (["Reference Quote"], [1], [{"asset_id":1, "project_id": project_id,"filename": "test.pdf","page_number": 1}])
    mock_user_repository.return_value.key = "test_api_key"
    mock_chat_query.return_value = {
        "response": "Response with references",
        "references": [
            {
                "sentence": "Reference Quote",
                "references": [{"file": "file1.pdf", "sentence": "Original sentence"}]
            }
        ]
    }
    mock_conversation_repository.create_new_conversation.return_value.id = 789
    mock_get_users_repository.return_value = MagicMock(id=1)
    mock_get_assets_filename.return_value = ["file1.pdf"]

    # Act
    response = client.post(f"/v1/chat/project/{project_id}", json=chat_request)

    # Assert
    assert response.status_code == 200
    assert len(response.json()["data"]["response_references"]) > 0

def test_chat_endpoint_with_conversation_id(mock_db, mock_vectorstore, mock_chat_query, mock_user_repository, mock_conversation_repository, mock_get_assets_filename):
    # Arrange
    project_id = 1
    chat_request = {
        "query": "Chat with conversation.",
        "conversation_id": "existing_convo_id"
    }

    mock_vectorstore.return_value.get_relevant_segments.return_value = (["Quote"], [1], {})
    mock_user_repository.return_value.key = "test_api_key"
    mock_chat_query.return_value = {"response": "Response with existing conversation", "references": []}
    mock_get_assets_filename.return_value = ["file1.pdf"]

    # Act
    response = client.post(f"/v1/chat/project/{project_id}", json=chat_request)

    # Assert
    assert response.status_code == 200
    assert response.json()["data"]["conversation_id"] == "existing_convo_id"
