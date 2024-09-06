from sqlalchemy import JSON, Column, Integer, String, ForeignKey
from .base import Base
from sqlalchemy.orm import relationship


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(255), nullable=False, default="pdf")
    filename = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    details = Column(JSON, nullable=True, default={})
    size = Column(Integer, nullable=True)

    process_steps = relationship("ProcessStep", back_populates="asset")
    content = relationship("AssetContent", back_populates="asset", uselist=False)

    def __repr__(self):
        return f"<Asset {self.filename}>"
