from sqlalchemy import (
    JSON,
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    Enum as SQLAlchemyEnum,
)
from .base import Base
from sqlalchemy.orm import relationship
from enum import Enum


class ProcessStatus(Enum):
    PENDING = 1
    IN_PROGRESS = 2
    COMPLETED = 3
    FAILED = 4
    STOPPED = 5


class Process(Base):
    __tablename__ = "processes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, default="")
    type = Column(String(255), nullable=False)
    status = Column(SQLAlchemyEnum(ProcessStatus), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    details = Column(JSON, nullable=True)
    message = Column(String(255), nullable=False)
    output = Column(JSON, nullable=True)

    project = relationship("Project", back_populates="processes")
    process_steps = relationship(
        "ProcessStep", back_populates="process", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Process {self.id}>"
