# dashboardroute.py

import logging
import requests
from flask import session, request
from flask_restful import Resource
from models import User, Holding, Trade, Crypto
from models.portfolio_snapshot import PortfolioSnapshot
from config import db, api
from datetime import datetime, timedelta

# set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_CHART_POINTS = 100  # granularity control

class DashboardResource(Resource):
    def get(self):
        try:
            user_id = session.get('user_id')
            if not user_id:
                logger.warning("Unauthorized access attempt to dashboard.")
                return {'error': 'Unauthorized'}, 401

            user = User.query.get(user_id)
            if not user:
                logger.warning(f"User not found for user_id: {user_id}")
                return {'error': 'User not found'}, 404

            valid_timeframes = {
                '1h': 1,
                '1d': 24,
                '1w': 24*7,
                '1m': 24*30,
                'all': None
            }
            timeframe = request.args.get('timeframe', '1d')
            if timeframe not in valid_timeframes:
                logger.warning(f"Invalid timeframe requested: {timeframe}")
                return {'error': f'Invalid timeframe. Choose from {list(valid_timeframes.keys())}.'}, 400

            # holdings 
            holdings = Holding.query.filter_by(user_id=user_id).all()
            holdings_data = []
            total_market_value = 0.0

            # Get all unique coingecko_ids for the user's holdings
            crypto_ids = []
            crypto_map = {}
            for holding in holdings:
                if holding.crypto_id:
                    crypto = Crypto.query.filter_by(id=holding.crypto_id).first()
                    if crypto and crypto.coingecko_id:
                        crypto_ids.append(crypto.coingecko_id)
                        crypto_map[crypto.coingecko_id] = crypto

            # Fetch live prices from CoinGecko for these coins
            prices = {}
            if crypto_ids:
                ids_string = ",".join(set(crypto_ids))
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_string}&vs_currencies=usd"
                try:
                    resp = requests.get(url, timeout=10)
                    if resp.ok:
                        prices = resp.json()
                        logger.info(f"CoinGecko prices response: {prices}")  # <--- Add this line
                except Exception as e:
                    logger.warning(f"Failed to fetch prices from CoinGecko: {e}")

            # Build holdings data with live prices
            for holding in holdings:
                crypto = Crypto.query.filter_by(id=holding.crypto_id).first()
                if crypto and crypto.coingecko_id:
                    live_price = prices.get(crypto.coingecko_id, {}).get("usd", 0)
                    market_value = live_price * holding.quantity
                    holdings_data.append({
                        "crypto_id": crypto.id,
                        "crypto_name": crypto.name,
                        "crypto_symbol": crypto.symbol,
                        "quantity": holding.quantity,
                        "live_price": live_price,
                        "market_value": market_value
                    })
                    total_market_value += market_value

            total_portfolio_value = total_market_value + user.usd_balance

            # --- Portfolio Value Chart Data from Snapshots ---
            now = datetime.utcnow()
            if valid_timeframes[timeframe]:
                start_time = now - timedelta(hours=valid_timeframes[timeframe])
            else:
                start_time = None

            snapshots_query = PortfolioSnapshot.query.filter_by(user_id=user_id)
            if start_time:
                snapshots_query = snapshots_query.filter(PortfolioSnapshot.timestamp >= start_time)
            snapshots = snapshots_query.order_by(PortfolioSnapshot.timestamp.asc()).all()

            chart_data = [
                {
                    "timestamp": snap.timestamp.isoformat(),
                    "portfolio_value": snap.total_value
                }
                for snap in snapshots
            ]

            # Granularity control (downsample if too many points)
            if len(chart_data) > MAX_CHART_POINTS:
                step = len(chart_data) // MAX_CHART_POINTS
                chart_data = [chart_data[i] for i in range(0, len(chart_data), step)]
                chart_data = chart_data[:MAX_CHART_POINTS]

            # Calculate change (percentage change over timeframe)
            if chart_data and chart_data[0]['portfolio_value'] > 0:
                change = (chart_data[-1]['portfolio_value'] - chart_data[0]['portfolio_value']) / chart_data[0]['portfolio_value']
            else:
                change = None

            # --- Trades ---
            trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.timestamp.desc()).all()
            trades_data = []
            for trade in trades:
                try:
                    crypto = Crypto.query.get(trade.crypto_id)
                    trades_data.append({
                        "trade_id": trade.id,
                        "crypto_id": crypto.id if crypto else None,
                        "crypto_name": crypto.name if crypto else None,
                        "crypto_symbol": crypto.symbol if crypto else None,
                        "type": trade.action,
                        "price": trade.price_at_trade,
                        "quantity": trade.quantity,
                        "timestamp": trade.timestamp.isoformat()
                    })
                except Exception as e:
                    logger.error(f"Error processing trade {trade.id}: {e}")

            return {
                "total_portfolio_value": total_portfolio_value,
                "change": change,
                "chart_data": chart_data,
                "holdings": holdings_data,
                "cash_balance": user.usd_balance,
                "cash_balance_formatted": user.usd_balance_formatted,
                "trades": trades_data
            }, 200

        except Exception as e:
            logger.critical(f"Critical error in dashboard endpoint: {e}", exc_info=True)
            return {"error": "An unexpected error occurred. Please try again later."}, 500




