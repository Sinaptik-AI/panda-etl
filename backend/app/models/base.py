from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declared_attr
from sqlalchemy.orm import declarative_base
from datetime import datetime

class BaseModel:
    @declared_attr
    def __tablename__(cls):
        return cls.__name__.lower()
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

Base = declarative_base(cls=BaseModel)
