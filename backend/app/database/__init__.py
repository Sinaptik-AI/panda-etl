from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.sql import Select
from app.database.query import SoftDeleteQuery
from app.config import settings

import logging

logger = logging.getLogger(__name__)

engine = create_engine(
    settings.sqlalchemy_database_url,
    connect_args={"check_same_thread": False},
    pool_size=30,
    max_overflow=40,
    pool_timeout=120,
)

SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, query_cls=SoftDeleteQuery
)

Base = declarative_base()


@event.listens_for(Session, "do_orm_execute")
def _add_filtering_criteria(execute_state):
    logger.debug(f"Executing query: {execute_state.statement}")
    if execute_state.is_select:
        stmt = execute_state.statement

        if isinstance(stmt, Select):
            tables = set()
            if hasattr(stmt, "froms"):
                for table in stmt.froms:
                    if hasattr(table, "name"):
                        tables.add(table)
            elif hasattr(stmt, "table"):
                tables.add(stmt.table)

            for table in tables:
                if hasattr(table.c, "deleted_at"):
                    logger.debug(f"Adding deleted_at filter for table: {table.name}")
                    stmt = stmt.where(table.c.deleted_at.is_(None))

            execute_state.statement = stmt

    logger.debug(f"Final query: {execute_state.statement}")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
