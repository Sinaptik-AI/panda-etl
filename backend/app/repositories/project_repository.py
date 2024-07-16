from sqlalchemy.orm import Session

from app import models
from app.schemas.project import ProjectCreate


def create_project(db: Session, project: ProjectCreate):
    db_project = models.Project(name=project.name, description=project.description)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


def get_projects(db: Session):
    return db.query(models.Project).all()


def get_project(db: Session, project_id: int):
    return db.query(models.Project).filter(models.Project.id == project_id).first()


def get_assets(db: Session, project_id: int):
    return db.query(models.Asset).filter(models.Asset.project_id == project_id).all()
