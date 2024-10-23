import pytest
from unittest.mock import Mock, patch
from app.processing.process_queue import (
    handle_exceptions,
    extract_process,
    update_process_step_status,
)
from app.exceptions import CreditLimitExceededException
from app.models import ProcessStepStatus

@pytest.fixture
def mock_logger():
    with patch('app.processing.process_queue.logger') as mock:
        yield mock

def test_handle_exceptions_decorator(mock_logger):
    @handle_exceptions
    def test_function():
        raise ValueError("Test error")

    with pytest.raises(ValueError):
        test_function()

    mock_logger.error.assert_called()

def test_handle_exceptions_decorator_credit_limit(mock_logger):
    @handle_exceptions
    def test_function():
        raise CreditLimitExceededException("Credit limit exceeded")

    with pytest.raises(CreditLimitExceededException):
        test_function()

    mock_logger.error.assert_called_with("Credit limit exceeded")

@patch('app.processing.process_queue.extract_data')
@patch('app.processing.process_queue.ChromaDB')
def test_extract_process(mock_chroma, mock_extract_data):
    mock_chroma_instance = Mock()
    mock_chroma.return_value = mock_chroma_instance
    mock_chroma_instance.get_relevant_docs.return_value = {
        "metadatas": [[{
            "page_number": 1,
            "previous_sentence_id": -1,
            "next_sentence_id": -1  # Add this line
        }]],
        "documents": [["Test document"]]
    }
    mock_extract_data.return_value = {
        "fields": {"field1": "value1"},
        "context": [[{"sources": ["source1"]}]]
    }

    process = Mock(id=1, project_id=1, details={"fields": [{"key": "field1"}]})
    process_step = Mock(id=1, asset=Mock(id=1))
    asset_content = Mock(content={"word_count": 1000, "content": ["Test content"]})

    result = extract_process("api_key", process, process_step, asset_content)

    assert "fields" in result
    assert "context" in result
    assert result["fields"] == {"field1": "value1"}
    assert result["context"][0][0]["page_numbers"] == [1]
    mock_extract_data.assert_called_once()
    mock_chroma_instance.get_relevant_docs.assert_called()

def test_update_process_step_status():
    mock_db = Mock()
    mock_process_step = Mock()
    mock_status = ProcessStepStatus.COMPLETED
    mock_output = {"test": "output"}
    mock_output_references = {"test": "references"}

    with patch('app.processing.process_queue.process_repository.update_process_step_status') as mock_update:
        update_process_step_status(mock_db, mock_process_step, mock_status, mock_output, mock_output_references)

    mock_update.assert_called_once_with(
        mock_db,
        mock_process_step,
        mock_status,
        output=mock_output,
        output_references=mock_output_references
    )
