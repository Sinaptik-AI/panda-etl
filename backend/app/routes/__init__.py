from flask import current_app as app

def register_routes(app):
    from .extract import extract

    app.register_blueprint(extract, url_prefix='/extract')