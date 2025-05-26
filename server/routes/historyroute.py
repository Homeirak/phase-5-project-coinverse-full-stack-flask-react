# historyroute.py

import logging
from flask import session
from flask_restful import Resource
from models import Trade, Crypto

logger = logging.getLogger(__name__)

class HistoryResource(Resource):
    def get(self):
        try:
            user_id = session.get('user_id')
            if not user_id:
                return {'error': 'Unauthorized'}, 401

            trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.timestamp.desc()).all()
            history = []
            for trade in trades:
                try:
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
                except Exception as e:
                    logger.error(f"Error processing trade {trade.id}: {e}")

            return {"history": history}, 200
        except Exception as e:
            logger.error(f"Error fetching trade history: {e}", exc_info=True)
            return {"error": "Failed to fetch trade history."}, 500
