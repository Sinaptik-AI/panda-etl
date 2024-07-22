from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from ..database import Base
from sqlalchemy.orm import relationship


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    process_steps = relationship("ProcessStep", back_populates="asset")

    def __repr__(self):
        return f"<Asset {self.filename}>"
