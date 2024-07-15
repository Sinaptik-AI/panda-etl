from flask import Blueprint, request, jsonify
from app.models import Project
from app import db

projects = Blueprint('projects', __name__)

@projects.route('', methods=['POST'])
def create_project():
    try:
        data = request.json

        if not data or 'title' not in data or not data['title'].strip():
            return jsonify({"status": "error", "message": "Project title is required"}), 400

        new_project = Project(
            name=data['title'],
            description=data.get('description', ''),
        )
        
        db.session.add(new_project)
        db.session.commit()
        
        return jsonify({
            "status": "success",
            "message": "Project created successfully",
            "data": {
                "id": new_project.id,
                "name": new_project.name,
                "description": new_project.description,
                "created_at": new_project.created_at.isoformat(),
                "updated_at": new_project.updated_at.isoformat()
            }
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500