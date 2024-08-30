from abc import ABC, abstractmethod
from typing import Iterable, List, Optional


class VectorStore(ABC):
    """Interface for vector store."""

    @abstractmethod
    def add_docs(
        self,
        docs: Iterable[str],
        ids: Optional[Iterable[str]] = None,
        metadatas: Optional[List[dict]] = None,
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
        raise NotImplementedError("add_docs method must be implemented by subclass.")

    def delete_docs(self, ids: Optional[List[str]] = None) -> Optional[bool]:
        """
        Delete by vector ID or other criteria.
        Args:
            ids: List of ids to delete

        Returns:
            Optional[bool]: True if deletion is successful,
            False otherwise
        """
        raise NotImplementedError("delete_docs method must be implemented by subclass.")

    def delete_collection(self, collection_name: str) -> Optional[bool]:
        """
        Delete the collection
        Args:
            collection_name (str): name of the collection

        Returns:
            Optional[bool]: _description_
        """

    def get_relevant_docs(self, question: str, k: int = 1) -> List[dict]:
        """
        Returns relevant documents based search
        """
        raise NotImplementedError(
            "get_relevant_docs method must be implemented by subclass."
        )
