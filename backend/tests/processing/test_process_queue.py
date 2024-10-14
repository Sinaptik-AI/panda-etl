import pytest
from unittest.mock import Mock, patch, mock_open
from app.processing.process_queue import (
    handle_exceptions,
    extractive_summary_process,
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

@patch('app.processing.process_queue.extract_summary')
@patch('app.processing.process_queue.highlight_sentences_in_pdf')
@patch('os.path.isfile')
@patch('builtins.open', new_callable=mock_open, read_data="test file content")
def test_extractive_summary_process(mock_file, mock_isfile, mock_highlight, mock_extract_summary):
    mock_isfile.return_value = True  # Mock the file existence check
    mock_extract_summary.return_value = {
        "summary": "Test summary",
        "summary_sentences": ["Sentence 1", "Sentence 2"]
    }
    mock_highlight.return_value = b"highlighted pdf content"

    process = Mock(id=1, details={})
    process_step = Mock(id=1, asset=Mock(path="/test/path", filename="test.pdf"))
    asset_content = Mock(content=None)

    result = extractive_summary_process("api_key", process, process_step, asset_content)

    assert result["summary"] == "Test summary"
    assert "highlighted_pdf" in result
    mock_extract_summary.assert_called_once()
    mock_highlight.assert_called_once()

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
