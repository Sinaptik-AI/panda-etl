import uuid
from sqlalchemy import UUID, Column, Integer, Text, ForeignKey
from .base import Base
from sqlalchemy.orm import relationship


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=True)
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<ConversationMessage Query: {self.query[:20]}>"
