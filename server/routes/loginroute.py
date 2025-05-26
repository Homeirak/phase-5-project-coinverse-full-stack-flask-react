# Loginroute.py
from flask import request, session
from flask_restful import Resource
from models import User
from config import db, api

class LoginResource(Resource):
    def post(self):
        data = request.get_json() or {}
        identifier = data.get("user_name") or data.get("email")
        password = data.get("password")

        if not identifier or not password:
            return {"error": "Username/email and password are required."}, 400

        # Determine if identifier is email or username
        if "@" in identifier:
            user = User.query.filter_by(email=identifier).first()
        else:
            user = User.query.filter_by(user_name=identifier).first()

        if not user or not user.check_password(password):
            return {"error": "Invalid credentials."}, 401

        session["user_id"] = user.id
        return {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "user_name": user.user_name,
                "email": user.email,
                "name": user.name,
                "theme": user.theme
            }
        }, 200



