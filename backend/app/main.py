from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from .models.base import Base
from .database import engine
from fastapi.middleware.cors import CORSMiddleware
from .config import settings

# Initialize the FastAPI app
app = FastAPI()

# Create the database tables
Base.metadata.create_all(bind=engine)

# Import and include the routes with the /v1 prefix
from .api import v1_router

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (for development)
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.mount("/assets", StaticFiles(directory=settings.upload_dir), name="assets")

app.include_router(v1_router, prefix="/v1")
