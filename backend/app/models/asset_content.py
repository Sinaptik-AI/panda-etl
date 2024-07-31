from sqlalchemy import Column, Integer, ForeignKey, Text
from .base import Base
from sqlalchemy.orm import relationship


class AssetContent(Base):
    __tablename__ = "asset_contents"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(
        Integer, ForeignKey("assets.id"), nullable=False, index=True, unique=True
    )
    content = Column(Text, nullable=False)

    asset = relationship("Asset", back_populates="content")

    def __repr__(self):
        return f"<AssetContent for Asset ID {self.asset_id}>"
