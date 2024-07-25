import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load environment variables from .env file
load_dotenv()


class Settings(BaseSettings):
    sqlalchemy_database_url: str
    upload_dir: str = os.path.join(os.path.dirname(__file__), "..", "uploads")
    process_dir: str = os.path.join(os.path.dirname(__file__), "..", "processed")
    api_server_url: str = "https://api.domer.ai"
    bambooetl_server_url: str
    openai_api_key: str
    ai_model: str = "gpt-4"

    class Config:
        env_file = ".env"


settings = Settings()
