from fastapi import FastAPI
from .database import engine, Base
from fastapi.middleware.cors import CORSMiddleware

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

app.include_router(v1_router, prefix="/v1")
