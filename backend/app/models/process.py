from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from ..database import Base
from sqlalchemy.orm import relationship


class Process(Base):
    __tablename__ = "processes"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(255), nullable=False)
    status = Column(Integer, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="processes")

    def __repr__(self):
        return f"<Process {self.id}>"
