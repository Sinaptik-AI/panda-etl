from typing import Union
from sqlalchemy.orm import Session, joinedload, defer, aliased
from sqlalchemy import asc, desc, func

from app import models
from app.schemas.project import ProjectCreate
from app.models.asset import Asset
from app.models.process_step import ProcessStepStatus


def create_project(db: Session, project: ProjectCreate):
    db_project = models.Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_projects(db: Session, page: int = 1, page_size: int = 20):
    total_count = db.query(func.count(models.Project.id)).scalar()
    projects = (
        db.query(models.Project).offset((page - 1) * page_size).limit(page_size).all()
    )
    return projects, total_count


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def get_assets(
    db: Session,
    project_id: int,
    page: Union[int, None] = None,
    page_size: Union[int, None] = None,
    order_by: str = "asc",
):
    total_count = (
        db.query(func.count(models.Asset.id))
        .filter(models.Asset.project_id == project_id)
        .scalar()
    )

    if order_by == "desc":
        order_by_column = desc(models.Asset.created_at)
    else:
        order_by_column = asc(models.Asset.created_at)

    if page_size:
        assets = (
            db.query(models.Asset)
            .filter(models.Asset.project_id == project_id)
            .order_by(order_by_column)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
    else:
        assets = (
            db.query(models.Asset)
            .filter(models.Asset.project_id == project_id)
            .order_by(order_by_column)
            .all()
        )
    return assets, total_count


def get_asset(db: Session, asset_id: int):
    return db.query(Asset).filter(Asset.id == asset_id).first()


def get_processes(db: Session, project_id: int):
    # Alias for the ProcessStep model to use in the query
    ProcessStepAlias = aliased(models.ProcessStep)

    # Subquery to get the count of completed ProcessStep
    completed_steps_count_subquery = (
        db.query(
            ProcessStepAlias.process_id,
            func.count(ProcessStepAlias.id).label("completed_steps_count"),
        )
        .filter(ProcessStepAlias.status == ProcessStepStatus.COMPLETED)
        .group_by(ProcessStepAlias.process_id)
        .subquery()
    )

    # Main query to get processes with the count of completed steps
    processes = (
        db.query(
            models.Process,
            func.coalesce(
                completed_steps_count_subquery.c.completed_steps_count, 0
            ).label("completed_steps_count"),
        )
        .filter(models.Process.project_id == project_id)
        .outerjoin(
            completed_steps_count_subquery,
            models.Process.id == completed_steps_count_subquery.c.process_id,
        )
        .options(joinedload(models.Process.project), defer(models.Process.output))
        .order_by(models.Process.id.desc())
        .all()
    )

    return processes


def add_asset_content(db: Session, asset_id: int, content: str):
    asset_content = models.AssetContent(asset_id=asset_id, content=content)
    db.add(asset_content)
    db.commit()


def get_asset_content(db: Session, asset_id: int):
    return (
        db.query(models.AssetContent)
        .filter(models.AssetContent.asset_id == asset_id)
        .first()
    )
