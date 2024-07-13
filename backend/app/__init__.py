from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')

    CORS(app, resources={r"/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from . import models
        from .routes import register_routes
        register_routes(app)
        db.create_all()

    return app


# from flask import Flask
# from flask_cors import CORS
# db = SQLAlchemy(app)
# migrate = Migrate(app, db)

# # Endpoints
# from api.extract import extract

# app = Flask(__name__)
# app.config['UPLOAD_FOLDER'] = 'tmp'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# CORS(app, resources={r"/*": {"origins": "*"}})

# db = SQLAlchemy(app)
# migrate = Migrate(app, db)

# app.register_blueprint(extract, url_prefix='/extract')

# if __name__ == '__main__':
#     app.run(debug=True)
