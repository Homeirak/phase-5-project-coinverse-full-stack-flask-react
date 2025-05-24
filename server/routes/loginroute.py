# Loginroute.py
from flask import request, session
from flask_restful import Resource
from models import User
from config import db, api

class LoginResource(Resource):
    def post(self):
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return {'error': 'Email and password are required.'}, 400

        user = User.query.filter_by(email=email).first()
        if not user or not user.check_password(password):
            return {'error': 'Invalid email or password.'}, 401

        session['user_id'] = user.id
        return {'message': 'Login successful', 'user': user.to_dict()}, 200



