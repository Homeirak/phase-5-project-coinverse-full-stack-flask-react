# Depositroute.py

from flask import session, request
from flask_restful import Resource
from models import User
from config import db

class DepositResource(Resource):
    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        data = request.get_json()
        amount = data.get('amount')

        if amount is None or amount <= 0:
            return {'error': 'Deposit amount must be positive.'}, 400

        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found.'}, 404

        user.usd_balance = (user.usd_balance or 0) + amount
        db.session.commit()

        return {'message': 'Deposit successful', 'usd_balance': user.usd_balance}, 200

