from sqlalchemy import Column, Integer, String, Text, ForeignKey
from .base import Base
from sqlalchemy.orm import relationship


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    processes = relationship("Process", back_populates="project")
    conversations = relationship("Conversation", back_populates="project")

    def __repr__(self):
        return f"<Project {self.name}>"
