# historyroute.py

from flask import session
from flask_restful import Resource
from models import Trade, Crypto

class HistoryResource(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.timestamp.desc()).all()
        history = []
        for trade in trades:
            crypto = Crypto.query.get(trade.crypto_id)
            history.append({
                "trade_id": trade.id,
                "crypto_name": crypto.name if crypto else None,
                "crypto_symbol": crypto.symbol if crypto else None,
                "type": trade.type,
                "price": trade.price,
                "quantity": trade.quantity,
                "timestamp": trade.timestamp.isoformat()
            })

        return {"history": history}, 200
