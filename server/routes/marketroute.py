# Marketroute.py

import logging
from flask import session, request
from flask_restful import Resource
from models import User, Crypto, Holding, Trade, Watchlist
from config import db, api
from datetime import datetime, timezone
import requests

logger = logging.getLogger(__name__)

def get_latest_price(crypto):
    if crypto.current_price and crypto.current_price > 0:
        return crypto.current_price

    if crypto.coingecko_id:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={crypto.coingecko_id}&vs_currencies=usd"
        try:
            resp = requests.get(url)
            if resp.status_code == 200:
                data = resp.json()
                price = data.get(crypto.coingecko_id, {}).get("usd")
                if price:
                    # Optionally update DB
                    crypto.current_price = price
                    db.session.commit()
                    return price
        except Exception as e:
            logger.error(f"Failed to fetch price for {crypto.name}: {e}", exc_info=True)
    return None

class MarketResource(Resource):
    def get(self):
        try:
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
        except Exception as e:
            logger.error(f"Error fetching coin list: {e}", exc_info=True)
            return {"error": "Failed to fetch coin list."}, 500

class WatchlistMarketResource(Resource):
    def get(self, crypto_id=None):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        try:
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
        except Exception as e:
            logger.error(f"Error fetching watchlist: {e}", exc_info=True)
            return {"error": "Failed to fetch watchlist."}, 500

    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        try:
            data = request.get_json() or {}
            crypto_id = data.get('crypto_id')
            if not crypto_id:
                return {'error': 'crypto_id is required'}, 400

            existing = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
            if existing:
                return {'message': 'Already in watchlist'}, 200

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
        except Exception as e:
            logger.error(f"Error adding to watchlist: {e}", exc_info=True)
            return {"error": "Failed to add to watchlist."}, 500

    def patch(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        try:
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
        except Exception as e:
            logger.error(f"Error updating watchlist: {e}", exc_info=True)
            return {"error": "Failed to update watchlist."}, 500

    def delete(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        try:
            watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
            if not watch:
                return {'error': 'Not in watchlist'}, 404

            db.session.delete(watch)
            db.session.commit()
            return {'message': 'Removed from watchlist'}, 200
        except Exception as e:
            logger.error(f"Error removing from watchlist: {e}", exc_info=True)
            return {"error": "Failed to remove from watchlist."}, 500

class TradeMarketResource(Resource):
    def post(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401

        user = User.query.get(user_id)
        crypto = Crypto.query.get(crypto_id)
        if not crypto:
            return {'error': 'Crypto not found'}, 404

        data = request.get_json() or {}
        action = data.get("action")  # "buy" or "sell"
        amount = data.get("amount")
        order_type = data.get("order_type", "market")  # "market", "limit", "stop-limit"
        limit_price = data.get("limit_price")
        stop_price = data.get("stop_price")

        if not isinstance(amount, (int, float)) or amount <= 0:
            return {'error': 'Amount must be positive.'}, 400

        price = get_latest_price(crypto)
        if price is None:
            return {'error': 'Could not fetch latest price.'}, 500

        # check funds for all buy orders
        if action == "buy":
            # for market orders, use current price; for limit/stop-limit, use limit_price
            check_price = price if order_type == "market" else limit_price
            if check_price is None or not isinstance(check_price, (int, float)):
                return {'error': 'Limit price required for this order type.'}, 400
            total_cost = check_price * amount
            if user.usd_balance < total_cost:
                return {'error': 'Insufficient funds.'}, 400

        # check holdings for all sell orders
        if action == "sell":
            holding = Holding.query.filter_by(user_id=user.id, crypto_id=crypto.id).first()
            if not holding or holding.amount < amount:
                return {'error': f'Insufficient {crypto.symbol} to sell.'}, 400

        # limit orders
        if order_type == "limit":
            if limit_price is None or not isinstance(limit_price, (int, float)):
                return {'error': 'Limit price required for limit order.'}, 400
            if action == "buy" and limit_price >= price:
                return {'error': 'Buy limit price must be below current market price.'}, 400
            if action == "sell" and limit_price <= price:
                return {'error': 'Sell limit price must be above current market price.'}, 400

        # stop-limit orders
        if order_type == "stop-limit":
            if stop_price is None or limit_price is None:
                return {'error': 'Stop price and limit price required for stop-limit order.'}, 400
            if action == "buy":
                if stop_price <= price or limit_price <= price:
                    return {'error': 'For buy stop-limit, both stop and limit price must be above market price.'}, 400
            if action == "sell":
                if stop_price >= price or limit_price >= price:
                    return {'error': 'For sell stop-limit, both stop and limit price must be below market price.'}, 400

        # market orders
        if order_type == "market":
            if action == "buy":
                user.usd_balance -= price * amount
                holding = Holding.query.filter_by(user_id=user.id, crypto_id=crypto.id).first()
                if holding:
                    holding.amount += amount
                else:
                    holding = Holding(user_id=user.id, crypto_id=crypto.id, amount=amount)
                    db.session.add(holding)
            elif action == "sell":
                holding = Holding.query.filter_by(user_id=user.id, crypto_id=crypto.id).first()
                holding.amount -= amount
                user.usd_balance += price * amount
            else:
                return {'error': 'Invalid action.'}, 400

        # create pending trade/order for limit and stop-limit orders
        new_trade = Trade(
            user_id=user.id,
            crypto_id=crypto.id,
            action=action,
            amount=amount,
            price_at_trade=price if order_type == "market" else None,
            order_type=order_type,
            limit_price=limit_price,
            stop_price=stop_price,
            status="pending" if order_type != "market" else "filled",
            timestamp=datetime.now(timezone.utc)
        )
        db.session.add(new_trade)
        db.session.commit()

        return {
            "message": "Trade placed successfully",
            "trade": {
                "id": new_trade.id,
                "crypto_id": crypto.id,
                "action": action,
                "amount": amount,
                "order_type": order_type,
                "limit_price": limit_price,
                "stop_price": stop_price,
                "status": new_trade.status
            },
            "usd_balance": user.usd_balance
        }, 201