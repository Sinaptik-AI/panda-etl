import pytest
from unittest.mock import MagicMock
from app.config import Settings
from app.vectorstore.chroma import ChromaDB

@pytest.fixture
def mock_settings(monkeypatch):
    monkeypatch.setenv("SQLALCHEMY_DATABASE_URL", "sqlite:///test.db")
    monkeypatch.setenv("USE_OPENAI_EMBEDDINGS", "false")
    monkeypatch.setenv("OPENAI_API_KEY", "")
    monkeypatch.setenv("CHROMA_BATCH_SIZE", "10")
    return Settings()

def test_chroma_db_initialization(mock_settings):
    chroma_db = ChromaDB(settings=mock_settings)
    assert chroma_db._batch_size == mock_settings.chroma_batch_size
    assert chroma_db._embedding_function.__class__.__name__ == "ONNXMiniLM_L6_V2"

def test_chroma_db_with_openai_embeddings():
    settings = Settings(use_openai_embeddings=True, openai_api_key="test_key")
    chroma_db = ChromaDB(settings=settings)
    assert chroma_db._embedding_function.__class__.__name__ == "OpenAIEmbeddingFunction"

def test_add_docs_with_custom_batch_size(mock_settings):
    chroma_db = ChromaDB(batch_size=3, settings=mock_settings)
    docs = ["doc1", "doc2", "doc3", "doc4", "doc5"]
    ids = ["id1", "id2", "id3", "id4", "id5"]
    metadatas = [{"key": "value", "filename": "test.txt"} for _ in range(5)]

    # Mock the _docs_collection.add method
    chroma_db._docs_collection.add = MagicMock()

    # Call add_docs with a custom batch size
    chroma_db.add_docs(docs, ids=ids, metadatas=metadatas, batch_size=2)

    # Assert that the _docs_collection.add method was called 3 times
    # (2 batches of 2 and 1 batch of 1)
    assert chroma_db._docs_collection.add.call_count == 3

def test_add_docs_with_openai_embeddings():
    settings = Settings(use_openai_embeddings=True, openai_api_key="test_key")
    chroma_db = ChromaDB(settings=settings)
    docs = ["doc1", "doc2", "doc3", "doc4", "doc5"]
    ids = ["id1", "id2", "id3", "id4", "id5"]
    metadatas = [{"key": "value", "filename": "test.txt"} for _ in range(5)]

    # Mock the _docs_collection.add method
    chroma_db._docs_collection.add = MagicMock()

    # Call add_docs
    chroma_db.add_docs(docs, ids=ids, metadatas=metadatas)

    # Assert that the _docs_collection.add method was called only once
    chroma_db._docs_collection.add.assert_called_once_with(
        documents=docs,
        metadatas=metadatas,
        ids=ids
    )

def test_max_file_size_setting(mock_settings):
    assert mock_settings.max_file_size == 20 * 1024 * 1024  # 20 MB

def test_chroma_batch_size_setting(mock_settings):
    assert mock_settings.chroma_batch_size == 10  # Set by the mock_settings fixture
