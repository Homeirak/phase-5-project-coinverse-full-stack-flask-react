# depositwithdrawalroute.py

from flask import session, request
from flask_restful import Resource
from models import User, Holding, Crypto, PortfolioSnapshot
from config import db
from datetime import datetime

def get_latest_price(crypto_obj):
    # Placeholder function for getting the latest price
    return crypto_obj.current_price if crypto_obj and crypto_obj.current_price else 0

class DepositResource(Resource):
    def post(self):
        # deposit logic
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

        user.usd_balance += amount
        db.session.commit()

        # portfolio snapshot logic; snapshot upon deposit
        holdings = Holding.query.filter_by(user_id=user.id).all()
        total_market_value = 0
        for h in holdings:
            crypto_obj = Crypto.query.get(h.crypto_id)
            live_price = get_latest_price(crypto_obj) if crypto_obj else 0
            total_market_value += (h.quantity or 0) * (live_price or 0)
        total_portfolio_value = user.usd_balance + total_market_value

        snapshot = PortfolioSnapshot(
            user_id=user.id,
            timestamp=datetime.utcnow(),
            total_value=total_portfolio_value,
            holdings_json={h.crypto_id: h.quantity for h in holdings}
        )
        db.session.add(snapshot)
        db.session.commit()

        return {"message": "Deposit successful", "usd_balance": user.usd_balance}, 200



