import os
import uuid
from typing import Callable, Iterable, List, Optional, Union

import chromadb
from chromadb import config
from chromadb.utils import embedding_functions

from app.vectorstore import VectorStore
from app.config import settings
import time


DEFAULT_EMBEDDING_FUNCTION = embedding_functions.DefaultEmbeddingFunction()


class ChromaDB(VectorStore):
    """
    Implementation of ChromeDB vector store
    """

    def __init__(
        self,
        collection_name: str = "panda-etl",
        embedding_function: Optional[Callable[[List[str]], List[float]]] = None,
        persist_path: Optional[str] = None,
        client_settings: Optional[config.Settings] = None,
        max_samples: int = 3,
        similary_threshold: int = 1.5,
    ) -> None:
        self._max_samples = max_samples
        self._similarity_threshold = similary_threshold

        # Initialize Chromadb Client
        # initialize from client settings if exists
        if client_settings:
            client_settings.persist_directory = (
                persist_path or client_settings.persist_directory
            )
            _client_settings = client_settings

        # use persist path if exists
        elif persist_path:
            _client_settings = config.Settings(
                is_persistent=True, anonymized_telemetry=False
            )
            _client_settings.persist_directory = persist_path
        # else use root as default path
        else:
            _client_settings = config.Settings(
                is_persistent=True, anonymized_telemetry=False
            )
            _client_settings.persist_directory = settings.chromadb_url

        self._client_settings = _client_settings
        self._client = chromadb.Client(_client_settings)
        self._persist_directory = _client_settings.persist_directory

        self._embedding_function = embedding_function or DEFAULT_EMBEDDING_FUNCTION

        self._docs_collection = self._client.get_or_create_collection(
            name=collection_name, embedding_function=self._embedding_function
        )

    def add_docs(
        self,
        docs: Iterable[str],
        ids: Optional[Iterable[str]] = None,
        metadatas: Optional[List[dict]] = None,
        batch_size=50,
    ) -> List[str]:
        """
        Add docs to the training set
        Args:
            docs: Iterable of strings to add to the vectorstore.
            ids: Optional Iterable of ids associated with the texts.
            metadatas: Optional list of metadatas associated with the texts.
            kwargs: vectorstore specific parameters

        Returns:
            List of ids from adding the texts into the vectorstore.
        """
        if ids is None:
            ids = [f"{str(uuid.uuid4())}-docs" for _ in docs]

        # Add previous_id and next_id to metadatas
        for idx, metadata in enumerate(metadatas):
            metadata["previous_sentence_id"] = ids[idx - 1] if idx > 0 else -1
            metadata["next_sentence_id"] = ids[idx + 1] if idx < len(ids) - 1 else -1

        for i in range(0, len(docs), batch_size):
            self._docs_collection.add(
                documents=docs[i : i + batch_size],
                metadatas=metadatas[i : i + batch_size],
                ids=ids[i : i + batch_size],
            )

    def delete_docs(
        self, ids: Optional[List[str]] = None, where: Optional[dict] = None
    ) -> Optional[bool]:
        """
        Delete by vector ID to delete docs
        Args:
            ids: List of ids to delete

        Returns:
            Optional[bool]: True if deletion is successful,
            False otherwise
        """

        if ids is None and where is not None:
            records_to_delete = self._docs_collection.get(where=where)
            ids = records_to_delete["ids"]

        self._docs_collection.delete(ids=ids)
        return True

    def get_relevant_docs(
        self, question: str, where: Optional[dict] = None, k: int = None
    ) -> List[dict]:
        """
        Returns relevant documents based search
        """
        k = k or self._max_samples

        if not where:
            relevant_data: chromadb.QueryResult = self._docs_collection.query(
                query_texts=question,
                n_results=k,
                include=["metadatas", "documents", "distances"],
            )
        else:
            relevant_data: chromadb.QueryResult = self._docs_collection.query(
                query_texts=question,
                n_results=k,
                include=["metadatas", "documents", "distances"],
                where=where,
            )

        return self._filter_docs_based_on_distance(
            relevant_data, self._similarity_threshold
        )

    def get_relevant_docs_by_id(self, ids: Iterable[str]) -> List[dict]:
        """
        Returns relevant question answers based on ids
        """

        relevant_data: chromadb.QueryResult = self._docs_collection.get(
            ids=ids,
            include=["metadatas", "documents"],
        )

        return relevant_data

    def _filter_docs_based_on_distance(
        self, documents: chromadb.QueryResult, threshold: int
    ) -> List[str]:
        """
        Filter documents based on threshold
        Args:
            documents (List[str]): list of documents in string
            distances (List[float]): list of distances in float
            threshold (int): similarity threshold

        Returns:
            _type_: _description_
        """
        filtered_data = [
            (doc, distance, metadata, ids)
            for doc, distance, metadata, ids in zip(
                documents["documents"][0],
                documents["distances"][0],
                documents["metadatas"][0],
                documents["ids"][0],
            )
            if distance < threshold
        ]

        return {
            key: [[data[i] for data in filtered_data]]
            for i, key in enumerate(["documents", "distances", "metadatas", "ids"])
        }
