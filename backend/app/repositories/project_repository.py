from typing import List, Union
from app.models.asset_content import AssetProcessingStatus
from sqlalchemy.orm import Session, joinedload, defer, aliased
from sqlalchemy import and_, asc, desc, func, or_

from app import models
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.models.asset import Asset
from app.models.process import Process
from app.models.process_step import ProcessStep, ProcessStepStatus
from datetime import datetime, timezone


def create_project(db: Session, project: ProjectCreate):
    db_project = models.Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_projects(db: Session, page: int = 1, page_size: int = 20):
    total_count = db.query(func.count(models.Project.id)).scalar()
    projects = (
        db.query(
            models.Project,
            func.count(models.Asset.id).label("asset_count"),  # Count the assets
        )
        .filter(models.Project.deleted_at == None)
        .outerjoin(models.Asset, models.Project.id == models.Asset.project_id)
        .group_by(models.Project.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return projects, total_count


def get_all_projects(db: Session):
    return db.query(models.Project).all()


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


def add_asset_content(db: Session, asset_id: int, content: dict):
    if content:
        asset_content = models.AssetContent(
            asset_id=asset_id,
            content=content,
            language=content["lang"],
            processing=AssetProcessingStatus.PENDING,
        )
    else:
        asset_content = models.AssetContent(
            asset_id=asset_id,
            processing=AssetProcessingStatus.PENDING,
        )
    db.add(asset_content)
    db.commit()
    return asset_content


def update_or_add_asset_content(db: Session, asset_id: int, content: dict):
    asset_content = (
        db.query(models.AssetContent)
        .filter(models.AssetContent.asset_id == asset_id)
        .first()
    )

    if asset_content:
        if content:
            asset_content.content = content
            asset_content.language = content.get("lang", asset_content.language)
    else:
        asset_content = models.AssetContent(
            asset_id=asset_id,
            content=content,
            language=content["lang"],
            processing=AssetProcessingStatus.PENDING,
        )
        db.add(asset_content)

    db.commit()
    db.refresh(asset_content)
    return asset_content


def update_asset_content_status(
    db: Session,
    status: AssetProcessingStatus,
    asset_content_id: int = None,
    asset_id: int = None,
):
    if asset_content_id:
        db.query(models.AssetContent).filter(
            models.AssetContent.id == asset_content_id
        ).update({models.AssetContent.processing: status})
        db.commit()
    elif asset_id:
        db.query(models.AssetContent).filter(
            models.AssetContent.asset_id == asset_id
        ).update({models.AssetContent.processing: status})
        db.commit()


def get_asset_content(db: Session, asset_id: int):
    return (
        db.query(models.AssetContent)
        .filter(models.AssetContent.asset_id == asset_id)
        .first()
    )


def delete_processes_and_steps(db: Session, project_id: int):

    process_ids = db.query(Process.id).filter(Process.project_id == project_id).all()

    process_ids = [process_id[0] for process_id in process_ids]

    current_timestamp = datetime.now(tz=timezone.utc)

    db.query(Process).filter(Process.project_id == project_id).update(
        {Process.deleted_at: current_timestamp}
    )

    if process_ids:
        db.query(ProcessStep).filter(ProcessStep.process_id.in_(process_ids)).update(
            {ProcessStep.deleted_at: current_timestamp}, synchronize_session=False
        )

    db.commit()


def get_assets_without_content(db: Session, project_id: int):
    return (
        db.query(models.Asset)
        .filter(models.Asset.project_id == project_id)
        .outerjoin(models.AssetContent, models.Asset.id == models.AssetContent.asset_id)
        .filter(models.AssetContent.id.is_(None))
        .all()
    )


def get_assets_content_pending(db: Session, project_id: int):
    return (
        db.query(models.Asset)
        .join(models.AssetContent)  # Join AssetContent to Asset
        .filter(
            and_(
                models.Asset.project_id == project_id,
                models.AssetContent.processing == AssetProcessingStatus.PENDING,
            )
        )
        .all()
    )


def get_assets_filename(db: Session, asset_ids: List[int]):
    return [
        asset.filename
        for asset in db.query(models.Asset).filter(models.Asset.id.in_(asset_ids)).all()
    ]


def get_assets_content_incomplete(db: Session, project_id: int):
    return (
        db.query(models.Asset)
        .join(models.AssetContent)  # Join AssetContent to Asset
        .filter(
            and_(
                models.Asset.project_id == project_id,
                or_(
                    models.AssetContent.processing == AssetProcessingStatus.IN_PROGRESS,
                    models.AssetContent.processing == AssetProcessingStatus.PENDING,
                ),
            )
        )
        .all()
    )


def update_project(db: Session, project_id: int, project: ProjectUpdate):
    db_project = get_project(db, project_id)
    if db_project is None:
        return None

    for key, value in project.dict(exclude_unset=True).items():
        setattr(db_project, key, value)

    db_project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_project)
    return db_project
