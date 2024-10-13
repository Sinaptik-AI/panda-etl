import unittest
from unittest.mock import patch, Mock
from io import BytesIO
from app.processing.process_queue import extractive_summary_process
from app.processing.process_queue import highlight_sentences_in_pdf
from app.processing.process_queue import extract_summary
import os
import builtins

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

    # Assert that extract_summary was called with the correct arguments
    mock_extract_summary.assert_called_once_with(
        api_token="api_key",
        config=process.details,
        file_path="/test/path",
        pdf_content=None
    )

    # Assert that highlight_sentences_in_pdf was called
    mock_highlight.assert_called_once()

    # Check the result
    assert "highlighted_pdf" in result
    assert "summary" in result
    assert result["summary"] == "Test summary"
