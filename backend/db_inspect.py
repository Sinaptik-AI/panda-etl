# db_inspect.py
from app import create_app, db
from app.models import User, Project, Asset
from sqlalchemy import inspect

app = create_app()

def get_table_names(engine):
    inspector = inspect(engine)
    return inspector.get_table_names()

def get_model_tables():
    return db.Model.metadata.tables.keys()

with app.app_context():
    print("Database URI:", app.config['SQLALCHEMY_DATABASE_URI'])
    print("\nExisting tables in the database:")
    print(get_table_names(db.engine))
    
    print("\nTables defined in models:")
    print(get_model_tables())
    
    print("\nDetailed model information:")
    for model in [User, Project, Asset]:
        print(f"\n{model.__name__}:")
        for column in model.__table__.columns:
            print(f"  - {column.name}: {column.type}")