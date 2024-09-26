import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    sqlalchemy_database_url: str
    chromadb_url: str = os.path.join(
        os.path.dirname(__file__), "..", "instance", "chromadb"
    )
    upload_dir: str = os.path.join(os.path.dirname(__file__), "..", "uploads")
    process_dir: str = os.path.join(os.path.dirname(__file__), "..", "processed")
    api_server_url: str = "https://api.domer.ai"
    pandaetl_server_url: str = "https://api.panda-etl.ai/"
    log_file_path: str = os.path.join(os.path.dirname(__file__), "..", "pandaetl.log")
    max_retries: int = 3
    max_relevant_docs: int = 10
    MAX_FILE_SIZE: int = 20 * 1024 * 1024

    class Config:
        env_file = ".env"


settings = Settings()
