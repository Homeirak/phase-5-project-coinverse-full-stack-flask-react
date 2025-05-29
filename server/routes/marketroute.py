# Marketroute.py

import logging
from flask import session, request
from flask_restful import Resource
from models import User, Crypto, Holding, Trade, Watchlist, PortfolioSnapshot
from config import db, api
from datetime import datetime
import requests

logger = logging.getLogger(__name__)

def get_latest_price(crypto):
    if crypto.current_price and crypto.current_price > 0:
        return crypto.current_price

    if crypto.coingecko_id:
        url = f"https://api.coingecko.com/api/v3/simple/price?ids={crypto.coingecko_id}&vs_currencies=usd"
        try:
            resp = requests.get(url, timeout=10)
            if resp.ok:
                data = resp.json()
                return data.get(crypto.coingecko_id, {}).get("usd")
        except Exception as e:
            logger.warning(f"Failed to fetch price for {crypto.coingecko_id}: {e}")
    return None

class MarketResource(Resource):
    def get(self):
        coins = Crypto.query.all()
        coin_list = [
            {
                "id": coin.id,
                "name": coin.name,
                "symbol": coin.symbol,
                "image_url": coin.image_url,
                "coingecko_id": coin.coingecko_id
            }
            for coin in coins
        ]
        return {"coins": coin_list}, 200

class CryptoListResource(Resource):
    def get(self):
        cryptos = Crypto.query.all()
        return [
            {
                "id": c.id,
                "name": c.name,
                "symbol": c.symbol,
                "coingecko_id": c.coingecko_id,
                "image_url": c.image_url
            }
            for c in cryptos
        ], 200

class WatchlistMarketResource(Resource):
    def get(self, crypto_id=None):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        if crypto_id:
            watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
            if not watch:
                return {'error': 'Not found'}, 404
            return {
                "crypto_id": watch.crypto_id,
                "target_price": watch.target_price,
                "alert_enabled": watch.alert_enabled
            }
        else:
            watchlist = Watchlist.query.filter_by(user_id=user_id).all()
            return {
                "watchlist": [
                    {
                        "crypto_id": w.crypto_id,
                        "target_price": w.target_price,
                        "alert_enabled": w.alert_enabled
                    } for w in watchlist
                ]
            }

    def post(self):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        data = request.get_json()
        crypto_id = data.get('crypto_id')
        if not crypto_id:
            return {'error': 'Missing crypto_id'}, 400
        watch = Watchlist(user_id=user_id, crypto_id=crypto_id, target_price=None, alert_enabled=False)
        db.session.add(watch)
        db.session.commit()
        return {"message": "Added"}, 201

    def patch(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
        if not watch:
            return {'error': 'Not found'}, 404
        data = request.get_json()
        if 'target_price' in data:
            watch.target_price = data['target_price']
        if 'alert_enabled' in data:
            watch.alert_enabled = data['alert_enabled']
        db.session.commit()
        return {"message": "Updated"}, 200

    def delete(self, crypto_id):
        user_id = session.get('user_id')
        if not user_id:
            return {'error': 'Unauthorized'}, 401
        watch = Watchlist.query.filter_by(user_id=user_id, crypto_id=crypto_id).first()
        if not watch:
            return {'error': 'Not found'}, 404
        db.session.delete(watch)
        db.session.commit()
        return {"message": "Deleted"}, 200

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
        action = data.get("action")
        quantity = data.get("quantity")
        order_type = data.get("order_type", "market")
        limit_price = data.get("limit_price")
        stop_price = data.get("stop_price")

        if not isinstance(quantity, (int, float)) or quantity <= 0:
            return {'error': 'Quantity must be positive.'}, 400

        price = get_latest_price(crypto)
        if price is None:
            return {'error': 'Could not fetch latest price.'}, 500

        # Check funds for buy
        if action == "buy":
            check_price = price if order_type == "market" else limit_price
            if check_price is None or not isinstance(check_price, (int, float)):
                return {'error': 'Limit price required for this order type.'}, 400
            total_cost = check_price * quantity
            if user.usd_balance < total_cost:
                return {'error': 'Insufficient funds.'}, 400

        # Check holdings for sell
        if action == "sell":
            holding = Holding.query.filter_by(user_id=user.id, crypto_id=crypto.id).first()
            if not holding or holding.quantity < quantity:
                return {'error': f'Insufficient {crypto.symbol} to sell.'}, 400

        # Limit order validation
        if order_type == "limit":
            if limit_price is None or not isinstance(limit_price, (int, float)):
                return {'error': 'Limit price required for limit order.'}, 400
            if action == "buy" and limit_price >= price:
                return {'error': 'Buy limit price must be below current market price.'}, 400
            if action == "sell" and limit_price <= price:
                return {'error': 'Sell limit price must be above current market price.'}, 400

        # Stop-limit order validation
        if order_type == "stop-limit":
            if stop_price is None or limit_price is None:
                return {'error': 'Stop price and limit price required for stop-limit order.'}, 400
            if action == "buy":
                if stop_price <= price or limit_price <= price:
                    return {'error': 'For buy stop-limit, both stop and limit price must be above market price.'}, 400
            if action == "sell":
                if stop_price >= price or limit_price >= price:
                    return {'error': 'For sell stop-limit, both stop and limit price must be below market price.'}, 400

        # Execute market order
        if order_type == "market":
            if action == "buy":
                user.usd_balance -= price * quantity
                holding = Holding.query.filter_by(user_id=user.id, crypto_id=crypto.id).first()
                if holding:
                    holding.quantity += quantity
                else:
                    holding = Holding(user_id=user.id, crypto_id=crypto.id, quantity=quantity)
                    db.session.add(holding)
            elif action == "sell":
                holding = Holding.query.filter_by(user_id=user.id, crypto_id=crypto.id).first()
                holding.quantity -= quantity
                user.usd_balance += price * quantity
            else:
                return {'error': 'Invalid action.'}, 400

        # Create trade record
        new_trade = Trade(
            user_id=user.id,
            crypto_id=crypto.id,
            action=action,
            quantity=quantity,
            price_at_trade=price if order_type == "market" else None,
            order_type=order_type,
            limit_price=limit_price,
            stop_price=stop_price,
            status="pending" if order_type != "market" else "filled",
            timestamp=datetime.utcnow()
        )
        db.session.add(new_trade)

        # portfolio snapshot logic
        # calculates the total portfolio value (cash + all holdings at current prices)
        holdings = Holding.query.filter_by(user_id=user.id).all()
        total_market_value = 0
        for h in holdings:
            crypto_obj = Crypto.query.get(h.crypto_id)
            live_price = get_latest_price(crypto_obj) if crypto_obj else 0
            total_market_value += (h.quantity or 0) * (live_price or 0)
        total_portfolio_value = user.usd_balance + total_market_value

        # save to portfolio_snapshot
        snapshot = PortfolioSnapshot(
            user_id=user.id,
            timestamp=datetime.utcnow(),
            total_value=total_portfolio_value,
            holdings_json={h.crypto_id: h.quantity for h in holdings}
        )
        db.session.add(snapshot)

        db.session.commit()

        return {
            "message": "Trade placed successfully",
            "trade": {
                "id": new_trade.id,
                "crypto_id": crypto.id,
                "action": action,
                "quantity": quantity,
                "order_type": order_type,
                "limit_price": limit_price,
                "stop_price": stop_price,
                "status": new_trade.status
            },
            "usd_balance": user.usd_balance
        }, 201

