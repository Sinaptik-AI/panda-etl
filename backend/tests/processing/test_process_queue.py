from app.requests.schemas import ExtractFieldsResponse
import pytest
from unittest.mock import Mock, patch
from app.processing.process_queue import (
    handle_exceptions,
    extract_process,
    update_process_step_status,
    find_best_match_for_short_reference,
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
            "next_sentence_id": -1
        }]],
        "documents": [["Test document"]]
    }
    mock_extract_data.return_value = ExtractFieldsResponse(fields=[{"field1": "value1"}],
        references=[[{
        "name": "ESG_Reporting_Assurance",
        "sources": [
          "Assurance"
        ]
      }]]
        )

    process = Mock(id=1, project_id=1, details={"fields": [{"key": "field1"}]})
    process_step = Mock(id=1, asset=Mock(id=1))
    asset_content = Mock(content={"word_count": 1000, "content": ["Test content"]})

    result = extract_process("api_key", process, process_step, asset_content)

    assert "fields" in result
    assert "context" in result
    assert result["fields"] == [{"field1": "value1"}]
    assert result["context"] == [[{'name': 'ESG_Reporting_Assurance', 'sources': ['Assurance'], 'page_numbers': []}]]
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

@patch('app.processing.process_queue.re.findall')
def test_find_best_match_for_short_reference(mock_findall):
    mock_findall.side_effect = [
        ['ai', 'and', 'machine', 'learning'],
        ['this', 'is', 'a', 'long', 'document', 'about', 'ai', 'and', 'machine', 'learning'],  # For the document text
        ['quantum', 'computing'],
        ['this', 'is', 'a', 'long', 'document', 'about', 'ai', 'and', 'machine', 'learning'],  # For the document text again
        ['another', 'document', 'talking', 'about', 'natural', 'language', 'processing'],  # For the second document
        [],
        ['this', 'is', 'a', 'long', 'document', 'about', 'ai', 'and', 'machine', 'learning']  # For the document text one more time
    ]
    all_relevant_docs = [
        {
            "documents": [["This is a long document about AI and machine learning."]],
            "metadatas": [[{"asset_id": 1, "project_id": 1, "page_number": 1}]]
        },
        {
            "documents": [["Another document talking about natural language processing."]],
            "metadatas": [[{"asset_id": 1, "project_id": 1, "page_number": 2}]]
        }
    ]

    # Test with a good match
    result = find_best_match_for_short_reference("AI and machine learning", all_relevant_docs, 1, 1)
    assert result is not None
    assert "text" in result
    assert "page_number" in result
    assert "AI" in result["text"] and "machine learning" in result["text"]

    # Test with a poor match
    result = find_best_match_for_short_reference("Quantum computing", all_relevant_docs, 1, 1)
    assert result is None

    assert mock_findall.call_count == 6

@pytest.mark.parametrize("short_reference, expected_result", [
    ("AI and machine learning", True),
    ("Quantum computing", False),
])
@patch('app.processing.process_queue.re.findall')
def test_find_best_match_for_short_reference_parametrized(mock_findall, short_reference, expected_result):
    mock_findall.side_effect = [
        short_reference.lower().split(),
        ['this', 'is', 'a', 'long', 'document', 'about', 'ai', 'and', 'machine', 'learning'],  # For the first document
        ['another', 'document', 'talking', 'about', 'natural', 'language', 'processing'],  # For the second document
    ]

    all_relevant_docs = [
        {
            "documents": [["This is a long document about AI and machine learning."]],
            "metadatas": [[{"asset_id": 1, "project_id": 1, "page_number": 1}]]
        },
        {
            "documents": [["Another document talking about natural language processing."]],
            "metadatas": [[{"asset_id": 1, "project_id": 1, "page_number": 2}]]
        }
    ]

    result = find_best_match_for_short_reference(short_reference, all_relevant_docs, 1, 1)

    if expected_result:
        assert result is not None
        assert "text" in result
        assert "page_number" in result
        assert short_reference.lower() in result["text"].lower()
    else:
        assert result is None

    assert mock_findall.call_count == 3

@patch('app.processing.process_queue.ChromaDB')
@patch('app.processing.process_queue.extract_data')
def test_chroma_db_initialization(mock_extract_data, mock_chroma):
    mock_chroma_instance = Mock()
    mock_chroma.return_value = mock_chroma_instance
    mock_extract_data.return_value = ExtractFieldsResponse(fields=[{"field1": "value1"}],
        references=[[{
        "name": "ESG_Reporting_Assurance",
        "sources": [
          "Assurance"
        ]
      }]]
        )

    process = Mock(id=1, project_id=1, details={"fields": [{"key": "field1"}]})
    process_step = Mock(id=1, asset=Mock(id=1))
    asset_content = Mock(content={"word_count": 100, "content": ["Short content"]})

    extract_process("api_key", process, process_step, asset_content)

    mock_chroma.assert_called_with(f"panda-etl-{process.project_id}", similarity_threshold=3)
    assert mock_chroma.call_count >= 1
