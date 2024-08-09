from sqlalchemy import JSON, Column, Integer, ForeignKey, String, Text
from .base import Base
from sqlalchemy.orm import relationship


class AssetContent(Base):
    __tablename__ = "asset_contents"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(
        Integer, ForeignKey("assets.id"), nullable=False, index=True, unique=True
    )
    content = Column(JSON, nullable=True)
    language = Column(String(10), nullable=True, default="en")

    asset = relationship("Asset", back_populates="content")

    def __repr__(self):
        return f"<AssetContent for Asset ID {self.asset_id}>"
