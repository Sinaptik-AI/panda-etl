from flask import current_app as app

def register_routes(app):
    from .extract import extract
    from .projects import projects

    app.register_blueprint(extract, url_prefix='/extract')
    app.register_blueprint(projects, url_prefix='/projects')