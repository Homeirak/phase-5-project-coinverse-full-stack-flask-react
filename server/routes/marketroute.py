# Marketroute.py

from flask import session, request
from flask_restful import Resource
from models import User, Crypto, Holding, Trade, Watchlist
from config import db, api
from datetime import datetime

class MarketResource(Resource):
    def get(self):
        # Return the list of coins from your database
        coins = Crypto.query.all()
        coin_list = [
            {
                "id": coin.id,
                "name": coin.name,
                "symbol": coin.symbol,
                "image_url": coin.image_url
            }
            for coin in coins
        ]
        return {"coins": coin_list}, 200

class WatchlistMarketResource(Resource):
    def get(self, crypto_id=None):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        if crypto_id:
            watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
            if not watch:
                return {'error': 'Not in watchlist'}, 404
            crypto = Crypto.query.get(watch.crypto_id)
            return {
                "crypto_id": watch.crypto_id,
                "crypto_name": crypto.name if crypto else None,
                "crypto_symbol": crypto.symbol if crypto else None,
                "target_price": watch.target_price,
                "alert_enabled": watch.alert_enabled
            }, 200

        # Otherwise, return the full watchlist
        watchlist = Watchlist.query.filter_by(user_id=user_id).all()
        result = []
        for entry in watchlist:
            crypto = Crypto.query.get(entry.crypto_id)
            result.append({
                "crypto_id": entry.crypto_id,
                "crypto_name": crypto.name if crypto else None,
                "crypto_symbol": crypto.symbol if crypto else None,
                "target_price": entry.target_price,
                "alert_enabled": entry.alert_enabled
            })
        return {"watchlist": result}, 200

    def post(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        existing = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
        if existing:
            return {'message': 'Already in watchlist'}, 200

        data = request.get_json() or {}
        target_price = data.get('target_price')
        alert_enabled = data.get('alert_enabled', False)

        new_watch = Watchlist(
            user_id=user_id,
            crypto_id=crypto_id,
            target_price=target_price,
            alert_enabled=alert_enabled
        )
        db.session.add(new_watch)
        db.session.commit()
        return {'message': 'Added to watchlist'}, 201

    def patch(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
        if not watch:
            return {'error': 'Not in watchlist'}, 404

        data = request.get_json()
        if 'target_price' in data:
            watch.target_price = data['target_price']
        if 'alert_enabled' in data:
            watch.alert_enabled = data['alert_enabled']

        db.session.commit()
        return {
            'message': 'Watchlist updated',
            'crypto_id': crypto_id,
            'target_price': watch.target_price,
            'alert_enabled': watch.alert_enabled
        }, 200

    def delete(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
        if not watch:
            return {'error': 'Not in watchlist'}, 404

        db.session.delete(watch)
        db.session.commit()
        return {'message': 'Removed from watchlist'}, 200

class TradeMarketResource(Resource):
    def post(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        data = request.get_json()
        trade_type = data.get('type')  # "buy" or "sell"
        order_type = data.get('order_type', 'market')  # "market", "limit", "stop-limit"
        limit_price = data.get('limit_price')

        # Always require quantity
        try:
            quantity = float(data.get('quantity'))
        except (TypeError, ValueError):
            return {'error': 'Quantity must be a number.'}, 400

        if trade_type not in ['buy', 'sell']:
            return {'error': 'Invalid trade type.'}, 400
        if quantity is None or quantity <= 0:
            return {'error': 'Quantity must be positive.'}, 400

        user = User.query.get(user_id)
        if not user:
            return {'error': 'User not found.'}, 404

        # Market order: fetch price from Crypto table
        if order_type == "market":
            crypto = Crypto.query.get(crypto_id)
            if not crypto or crypto.price is None:
                return {'error': 'Market price unavailable.'}, 400
            price = crypto.price
            status = "executed"
            total_cost = price * quantity

            if trade_type == 'buy':
                if user.usd_balance is None or user.usd_balance < total_cost:
                    return {'error': 'Insufficient USD balance.'}, 400
                user.usd_balance -= total_cost
                holding = Holding.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
                if holding:
                    holding.quantity += quantity
                else:
                    holding = Holding(user_id=user_id, crypto_id=crypto_id, quantity=quantity)
                    db.session.add(holding)
            elif trade_type == 'sell':
                holding = Holding.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
                if not holding or holding.quantity < quantity:
                    return {'error': 'Not enough holdings to sell.'}, 400
                user.usd_balance += total_cost
                holding.quantity -= quantity

        # Limit or stop-limit order: require limit_price, do not execute immediately
        else:
            if limit_price is None:
                return {'error': 'Limit price required for limit/stop-limit orders.'}, 400
            try:
                price = float(limit_price)
            except (TypeError, ValueError):
                return {'error': 'Limit price must be a number.'}, 400
            status = "pending"

        new_trade = Trade(
            user_id=user_id,
            crypto_id=crypto_id,
            type=trade_type,
            price=price,
            quantity=quantity,
            timestamp=datetime.utcnow(),
            status=status,
            order_type=order_type,
            limit_price=limit_price if order_type != "market" else None
        )
        db.session.add(new_trade)
        db.session.commit()

        return {'message': 'Trade placed successfully', 'trade': {
            "id": new_trade.id,
            "type": new_trade.type,
            "price": new_trade.price,
            "quantity": new_trade.quantity,
            "timestamp": new_trade.timestamp.isoformat(),
            "status": new_trade.status,
            "order_type": new_trade.order_type,
            "limit_price": new_trade.limit_price
        }}, 201

    def patch(self, crypto_id, trade_id):
        user_id = session.get('user_id')
        trade = Trade.query.filter_by(id=trade_id, user_id=user_id, crypto_id=crypto_id, status="pending").first()
        if not trade:
            return {'error': 'Pending trade not found.'}, 404

        data = request.get_json()
        if 'price' in data:
            trade.price = data['price']
        if 'quantity' in data:
            trade.quantity = data['quantity']
        if 'limit_price' in data:
            trade.limit_price = data['limit_price']
        if 'status' in data and data['status'] == 'cancelled':
            trade.status = 'cancelled'
        db.session.commit()
        return {'message': 'Trade updated.'}, 200

    def delete(self, crypto_id, trade_id):
        user_id = session.get('user_id')
        trade = Trade.query.filter_by(id=trade_id, user_id=user_id, crypto_id=crypto_id, status="pending").first()
        if not trade:
            return {'error': 'Pending trade not found.'}, 404
        db.session.delete(trade)
        db.session.commit()
        return {'message': 'Trade deleted.'}, 200