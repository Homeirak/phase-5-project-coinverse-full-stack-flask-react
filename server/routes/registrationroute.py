# Registrationroute.py

import re
from flask import request, session
from flask_restful import Resource
from models import User
from config import db, api

class RegistrationResource(Resource):
    def post(self):
        data = request.get_json()
        user_name = data.get('user_name')
        email = data.get('email')
        password = data.get('password')

        # Basic presence check
        if not user_name or not email or not password:
            return {'error': 'User name, email, and password are required.'}, 400

        # Username validation
        if len(user_name) < 3 or not user_name.isalnum():
            return {'error': 'Username must be at least 3 characters and alphanumeric.'}, 400

        # Email format validation
        email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_regex, email):
            return {'error': 'Invalid email format.'}, 400

        # Password strength validation
        if len(password) < 8:
            return {'error': 'Password must be at least 8 characters.'}, 400

        # Check for duplicate email
        if User.query.filter_by(email=email).first():
            return {'error': 'Email already registered.'}, 400

        # Check for duplicate username
        if User.query.filter_by(user_name=user_name).first():
            return {'error': 'Username already taken.'}, 400

        new_user = User(
            user_name=user_name,
            email=email,
            usd_balance=0.0  # Default balance on registration
        )
        new_user.password_hash = password  # Hash and store the password

        db.session.add(new_user)
        db.session.commit()

        # Optionally log the user in after registration
        session['user_id'] = new_user.id

        return {'message': 'Registration successful', 'user': new_user.to_dict()}, 201


