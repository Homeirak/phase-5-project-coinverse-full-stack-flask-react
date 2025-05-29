# check_current_userroute.py
from flask import session
from flask_restful import Resource
from models import User

class CheckCurrentUserResource(Resource):
    def get(self):
        user_id = session.get("user_id")
        if not user_id:
            return {"error": "No user is logged in. Please log in to access this resource."}, 401
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        return {
            "id": user.id,
            "user_name": user.user_name,
            "email": user.email,
            "name": user.name,
            "theme": user.theme
        }, 200