# logoutroute.py

from flask import session
from flask_restful import Resource

class LogoutResource(Resource):
    def post(self):
        session.pop('user_id', None)
        return {'message': 'Logged out successfully'}, 200