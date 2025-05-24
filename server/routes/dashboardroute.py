# Dashboardroute.py

from flask import session
from flask_restful import Resource
from models import User, Holding, Trade, Crypto
from config import db, api

class DashboardResource(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found'}, 404

        # Get holdings
        holdings = Holding.query.filter_by(user_id=user_id).all()
        holdings_data = []
        for holding in holdings:
            crypto = Crypto.query.get(holding.crypto_id)
            holdings_data.append({
                "crypto_id": crypto.id,
                "crypto_name": crypto.name,
                "crypto_symbol": crypto.symbol,
                "quantity": holding.quantity
            })

        # Get trade history
        trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.timestamp.asc()).all()
        trades_data = []
        for trade in trades:
            crypto = Crypto.query.get(trade.crypto_id)
            trades_data.append({
                "trade_id": trade.id,
                "crypto_id": crypto.id,
                "crypto_name": crypto.name,
                "crypto_symbol": crypto.symbol,
                "type": trade.type,
                "price": trade.price,
                "quantity": trade.quantity,
                "timestamp": trade.timestamp.isoformat()
            })

        return {
            "holdings": holdings_data,
            "trades": trades_data,
            "usd_balance": user.usd_balance
        }, 200


