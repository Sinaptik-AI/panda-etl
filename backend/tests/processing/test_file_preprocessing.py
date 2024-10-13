import pytest
from unittest.mock import MagicMock, patch
from app.processing.file_preprocessing import (
    process_segmentation,
    preprocess_file,
    extract_text_with_retries,
)
from app.models.asset_content import AssetProcessingStatus

@pytest.mark.asyncio
async def test_process_segmentation():
    with patch('app.processing.file_preprocessing.ChromaDB') as MockChromaDB, \
         patch('app.processing.file_preprocessing.get_asset_content') as mock_get_asset_content, \
         patch('app.processing.file_preprocessing.add_to_vectorstore') as mock_add_to_vectorstore, \
         patch('app.processing.file_preprocessing.update_asset_content_status') as mock_update_status:
        
        mock_get_asset_content.return_value = MagicMock()
        mock_vectorstore = MagicMock()
        MockChromaDB.return_value = mock_vectorstore

        await process_segmentation(1, 1, "test.pdf")

        MockChromaDB.assert_called_once_with("panda-etl-1")
        mock_get_asset_content.assert_called_once_with(1)
        mock_add_to_vectorstore.assert_called_once()
        mock_update_status.assert_called_once_with(1, AssetProcessingStatus.COMPLETED)

@pytest.mark.asyncio
async def test_preprocess_file():
    with patch('app.processing.file_preprocessing.get_asset') as mock_get_asset, \
         patch('app.processing.file_preprocessing.get_user_api_key') as mock_get_api_key, \
         patch('app.processing.file_preprocessing.update_or_add_asset_content') as mock_update_content, \
         patch('app.processing.file_preprocessing.extract_text_with_retries') as mock_extract_text, \
         patch('app.processing.file_preprocessing.file_segmentation_executor.submit') as mock_submit:
        
        mock_asset = MagicMock(project_id=1, filename="test.pdf")
        mock_get_asset.return_value = mock_asset
        mock_get_api_key.return_value = "test_api_key"
        mock_update_content.return_value = MagicMock(id=1)
        mock_extract_text.return_value = {"content": "test content"}

        await preprocess_file(1)

        mock_get_asset.assert_called_once_with(1)
        mock_get_api_key.assert_called_once()
        assert mock_update_content.call_count == 2
        mock_extract_text.assert_called_once_with("test_api_key", mock_asset)
        mock_submit.assert_called_once()

@pytest.mark.asyncio
async def test_extract_text_with_retries():
    with patch('app.processing.file_preprocessing.extract_text_from_file') as mock_extract_text, \
         patch('app.processing.file_preprocessing.settings.max_retries', 3):
        
        mock_asset = MagicMock(id=1, path="/test/path", type="pdf")
        mock_extract_text.side_effect = [Exception("API Error"), {"content": "test content"}]

        result = await extract_text_with_retries("test_api_key", mock_asset)

        assert result == {"content": "test content"}
        assert mock_extract_text.call_count == 2

@pytest.mark.asyncio
async def test_extract_text_with_retries_failure():
    with patch('app.processing.file_preprocessing.extract_text_from_file') as mock_extract_text, \
         patch('app.processing.file_preprocessing.settings.max_retries', 3):
        
        mock_asset = MagicMock(id=1, path="/test/path", type="pdf")
        mock_extract_text.side_effect = Exception("API Error")

        result = await extract_text_with_retries("test_api_key", mock_asset)

        assert result is None
        assert mock_extract_text.call_count == 3
