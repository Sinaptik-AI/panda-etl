from concurrent.futures import ThreadPoolExecutor
import traceback
from app.models.asset_content import AssetProcessingStatus
from app.database import SessionLocal
from app.repositories import project_repository
from app.repositories import user_repository
from app.requests import extract_file_segmentation, extract_text_from_file
from app.logger import Logger
from app.config import settings

from app.vectorstore.chroma import ChromaDB


# Thread pool executor for background tasks
file_preprocessor = ThreadPoolExecutor(max_workers=5)

logger = Logger()


def process_file(asset_id: int):
    file_preprocessor.submit(preprocess_file, asset_id)


def preprocess_file(asset_id: int):
    try:
        with SessionLocal() as db:
            asset = project_repository.get_asset(db=db, asset_id=asset_id)
            api_key = user_repository.get_user_api_key(db)
            retries = 0
            success = False

            while retries < settings.max_retries and not success:
                try:
                    pdf_content = extract_text_from_file(
                        api_key.key, asset.path, asset.type
                    )
                    asset_content = project_repository.update_or_add_asset_content(
                        db, asset_id, pdf_content
                    )
                    segmentation = extract_file_segmentation(
                        api_token=api_key.key, pdf_content=pdf_content
                    )
                    vectorstore = ChromaDB(f"panda-etl-{asset.project_id}")
                    vectorstore.add_docs(
                        docs=segmentation["segments"],
                        metadatas=[
                            {"doc_id": asset.id, "project_id": asset.project_id}
                            for _ in segmentation["segments"]
                        ],
                    )
                    project_repository.update_asset_content_status(
                        db,
                        asset_id=asset_content.id,
                        status=AssetProcessingStatus.COMPLETED,
                    )
                    success = True
                except Exception as e:
                    logger.error(traceback.format_exc())
                    retries += 1
                    if retries == settings.max_retries:
                        project_repository.update_asset_content_status(
                            db,
                            asset_id=asset_content.id,
                            status=AssetProcessingStatus.FAILED,
                        )
                    logger.error(
                        f"Error during retry {retries} for asset {asset_id}: {e}"
                    )

    except Exception as e:
        with SessionLocal() as db:
            project_repository.update_asset_content_status(
                db, asset_id=asset_id, status=AssetProcessingStatus.FAILED
            )

        logger.error(f"Failed to preprocess asset {asset_id}: {e}")
