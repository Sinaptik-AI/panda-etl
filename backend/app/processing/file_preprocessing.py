import asyncio
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm.exc import ObjectDeletedError
from app.models.asset_content import AssetProcessingStatus
from app.database import SessionLocal
from app.repositories import project_repository, user_repository
from app.requests import extract_text_from_file
from app.logger import Logger
from app.config import settings
from app.vectorstore.chroma import ChromaDB

logger = Logger()

# Thread pool executors for background tasks
file_preprocessor = ThreadPoolExecutor(max_workers=5)
file_segmentation_executor = ThreadPoolExecutor(max_workers=1)

async def process_file(asset_id: int) -> None:
    """
    Process a file asynchronously.
    
    Args:
        asset_id (int): The ID of the asset to process.
    """
    await asyncio.get_event_loop().run_in_executor(
        file_preprocessor, preprocess_file, asset_id
    )

async def process_segmentation(project_id: int, asset_content_id: int, asset_file_name: str) -> None:
    """
    Process segmentation for an asset.
    
    Args:
        project_id (int): The ID of the project.
        asset_content_id (int): The ID of the asset content.
        asset_file_name (str): The filename of the asset.
    """
    try:
        asset_content = await get_asset_content(asset_content_id)
        if not asset_content:
            logger.error(f"Asset content with id {asset_content_id} not found")
            return

        vectorstore = ChromaDB(f"panda-etl-{project_id}")
        await add_to_vectorstore(vectorstore, asset_content, asset_file_name, project_id)

        await update_asset_content_status(
            asset_content_id, AssetProcessingStatus.COMPLETED
        )

    except Exception as e:
        logger.error(f"Error during segmentation for asset {asset_content_id}: {e}")
        await update_asset_content_status(
            asset_content_id, AssetProcessingStatus.FAILED
        )

async def preprocess_file(asset_id: int) -> None:
    """
    Preprocess a file.
    
    Args:
        asset_id (int): The ID of the asset to preprocess.
    """
    try:
        asset = await get_asset(asset_id)
        if not asset:
            logger.error(f"Asset with id {asset_id} not found in the database")
            return

        api_key = await get_user_api_key()
        asset_content = await update_or_add_asset_content(asset_id, None)

        pdf_content = await extract_text_with_retries(api_key, asset)

        if pdf_content:
            asset_content = await update_or_add_asset_content(asset_id, pdf_content)
            await asyncio.get_event_loop().run_in_executor(
                file_segmentation_executor,
                process_segmentation,
                asset.project_id,
                asset_content.id,
                asset.filename,
            )

    except Exception as e:
        logger.error(f"Failed to preprocess asset {asset_id}: {e}")
        await update_asset_content_status(asset_id, AssetProcessingStatus.FAILED)

async def extract_text_with_retries(api_key: str, asset) -> Optional[dict]:
    """
    Extract text from a file with retries.
    
    Args:
        api_key (str): The API key for text extraction.
        asset: The asset object containing file information.
    
    Returns:
        Optional[dict]: The extracted content or None if extraction failed.
    """
    for retry in range(settings.max_retries):
        try:
            return await asyncio.get_event_loop().run_in_executor(
                None, extract_text_from_file, api_key, asset.path, asset.type
            )
        except ObjectDeletedError:
            logger.error(f"Asset with id {asset.id} was deleted during processing")
            return None
        except Exception as e:
            logger.error(f"Error during retry {retry} for asset {asset.id}: {e}")
    
    logger.error(f"Failed to extract text for asset {asset.id} after {settings.max_retries} retries")
    return None

# Database operations (these could be moved to a separate module)

async def get_asset(asset_id: int):
    with SessionLocal() as db:
        return project_repository.get_asset(db=db, asset_id=asset_id)

async def get_asset_content(asset_content_id: int):
    with SessionLocal() as db:
        return project_repository.get_asset_content(db, asset_content_id)

async def get_user_api_key():
    with SessionLocal() as db:
        api_key = user_repository.get_user_api_key(db)
        return api_key.key

async def update_or_add_asset_content(asset_id: int, content: Optional[dict]):
    with SessionLocal() as db:
        return project_repository.update_or_add_asset_content(db, asset_id, content)

async def update_asset_content_status(asset_id: int, status: AssetProcessingStatus):
    with SessionLocal() as db:
        project_repository.update_asset_content_status(db, asset_id=asset_id, status=status)

async def add_to_vectorstore(vectorstore, asset_content, asset_file_name: str, project_id: int):
    vectorstore.add_docs(
        docs=asset_content.content["content"],
        metadatas=[
            {
                "asset_id": asset_content.asset_id,
                "filename": asset_file_name,
                "project_id": project_id,
                "page_number": asset_content.content["page_number_data"][index],
            }
            for index, _ in enumerate(asset_content.content["content"])
        ],
    )
