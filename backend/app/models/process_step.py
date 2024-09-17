from sqlalchemy import (
    Column,
    Integer,
    ForeignKey,
    JSON,
    DateTime,
    Enum as SQLAlchemyEnum,
)
from sqlalchemy.orm import relationship
from .base import Base
from enum import Enum


class ProcessStepStatus(Enum):
    PENDING = 1
    IN_PROGRESS = 2
    COMPLETED = 3
    FAILED = 4


class ProcessStep(Base):
    __tablename__ = "process_steps"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(Integer, ForeignKey("processes.id"), nullable=False)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    output = Column(JSON, nullable=True)
    status = Column(SQLAlchemyEnum(ProcessStepStatus), nullable=False)
    output_references = Column(JSON, nullable=True)

    process = relationship("Process", back_populates="process_steps")
    asset = relationship("Asset", back_populates="process_steps")

    def __repr__(self):
        return f"<ProcessStep {self.id}>"
