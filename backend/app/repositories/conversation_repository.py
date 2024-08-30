from app.models import Conversation
from app.models import ConversationMessage
from sqlalchemy.orm import Session


def create_new_conversation(db: Session, project_id: int, user_id: int, title: str):
    conv = Conversation(project_id=project_id, user_id=user_id, title=title)
    db.add(conv)
    db.commit()
    return conv


def create_conversation_message(
    db: Session, conversation_id: str, query: str, response: str
):
    conv_message = ConversationMessage(
        conversation_id=conversation_id, query=query, response=response
    )
    db.add(conv_message)
    db.commit()
    return conv_message
