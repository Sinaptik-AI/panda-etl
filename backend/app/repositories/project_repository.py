from typing import Union
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models
from app.schemas.project import ProjectCreate
from app.models.asset import Asset


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
):
    total_count = (
        db.query(func.count(models.Asset.id))
        .filter(models.Asset.project_id == project_id)
        .scalar()
    )
    if page_size:
        assets = (
            db.query(models.Asset)
            .filter(models.Asset.project_id == project_id)
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
    else:
        assets = (
            db.query(models.Asset).filter(models.Asset.project_id == project_id).all()
        )
    return assets, total_count


def get_asset(db: Session, asset_id: int):
    return db.query(Asset).filter(Asset.id == asset_id).first()


def get_processes(db: Session, project_id: int):
    return (
        db.query(models.Process)
        .filter(models.Process.project_id == project_id)
        .order_by(models.Process.id.desc())
        .all()
    )


def add_asset_content(db: Session, asset_id: int, content: str):
    print("Creating....")
    asset_content = models.AssetContent(asset_id=asset_id, content=content)
    print("Done....")
    db.add(asset_content)
    db.commit()


def get_asset_content(db: Session, asset_id: int):
    return (
        db.query(models.AssetContent)
        .filter(models.AssetContent.asset_id == asset_id)
        .first()
    )
