# Dashboardroute.py

import logging
import requests
from flask import session, request
from flask_restful import Resource
from models import User, Holding, Trade, Crypto
from config import db, api
from datetime import datetime, timedelta
from utils.cache import get_price_from_cache, set_price_in_cache

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MAX_CHART_POINTS = 100  # Granularity control

def fetch_historical_price(coingecko_id, dt):
    date_str = dt.strftime('%d-%m-%Y')
    cached = get_price_from_cache(coingecko_id, date_str)
    if cached is not None:
        return cached
    url = f"https://api.coingecko.com/api/v3/coins/{coingecko_id}/history?date={date_str}"
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code == 429:
            stale = get_price_from_cache(coingecko_id, date_str, allow_stale=True)
            if stale is not None:
                logger.warning(f"Rate limited for {coingecko_id} on {date_str}, serving stale cache.")
                return stale
            logger.warning(f"Rate limited for {coingecko_id} on {date_str}, no cache available.")
            return 0
        if resp.status_code == 200:
            data = resp.json()
            price = data.get('market_data', {}).get('current_price', {}).get('usd', 0)
            set_price_in_cache(coingecko_id, price, date_str)
            return price
        logger.error(f"Unexpected status code {resp.status_code} for {coingecko_id} on {date_str}")
    except Exception as e:
        stale = get_price_from_cache(coingecko_id, date_str, allow_stale=True)
        if stale is not None:
            logger.error(f"Error fetching price for {coingecko_id} on {date_str}: {e}. Serving stale cache.")
            return stale
        logger.error(f"Error fetching price for {coingecko_id} on {date_str}: {e}. No cache available.")
    return 0

def fetch_market_chart(coingecko_id, days):
    key = f"chart:{days}"
    cached = get_price_from_cache(coingecko_id, key)
    if cached is not None:
        return cached
    url = f"https://api.coingecko.com/api/v3/coins/{coingecko_id}/market_chart?vs_currency=usd&days={days}"
    try:
        resp = requests.get(url, timeout=15)
        if resp.status_code == 429:
            stale = get_price_from_cache(coingecko_id, key, allow_stale=True)
            if stale is not None:
                logger.warning(f"Rate limited for market chart {coingecko_id} days={days}, serving stale cache.")
                return stale
            logger.warning(f"Rate limited for market chart {coingecko_id} days={days}, no cache available.")
            return []
        if resp.status_code == 200:
            data = resp.json()
            prices = data.get('prices', [])
            set_price_in_cache(coingecko_id, prices, key)
            return prices
        logger.error(f"Unexpected status code {resp.status_code} for market chart {coingecko_id} days={days}")
    except Exception as e:
        stale = get_price_from_cache(coingecko_id, key, allow_stale=True)
        if stale is not None:
            logger.error(f"Error fetching market chart for {coingecko_id} days={days}: {e}. Serving stale cache.")
            return stale
        logger.error(f"Error fetching market chart for {coingecko_id} days={days}: {e}. No cache available.")
    return []

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

            holdings = Holding.query.filter_by(user_id=user_id).all()
            holdings_data = []
            total_market_value = 0.0
            coingecko_ids = []
            holding_map = {}

            for holding in holdings:
                crypto = Crypto.query.get(holding.crypto_id)
                if crypto and crypto.coingecko_id:
                    coingecko_ids.append(crypto.coingecko_id)
                    holding_map[crypto.coingecko_id] = {
                        "crypto_id": crypto.id,
                        "crypto_name": crypto.name,
                        "crypto_symbol": crypto.symbol,
                        "quantity": holding.quantity
                    }

            prices = {}
            if coingecko_ids:
                ids_str = ",".join(coingecko_ids)
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={ids_str}&vs_currencies=usd"
                try:
                    response = requests.get(url, timeout=10)
                    response.raise_for_status()
                    prices = response.json()
                    for coingecko_id in coingecko_ids:
                        price = prices.get(coingecko_id, {}).get('usd', 0)
                        set_price_in_cache(coingecko_id, price)
                except Exception as e:
                    logger.error(f"Error fetching live prices: {e}")
                    prices = {}

            for coingecko_id, holding in holding_map.items():
                try:
                    live_price = prices.get(coingecko_id, {}).get('usd', get_price_from_cache(coingecko_id) or 0)
                    market_value = live_price * holding["quantity"]
                    holding.update({
                        "live_price": live_price,
                        "market_value": market_value
                    })
                    holdings_data.append(holding)
                    total_market_value += market_value
                except Exception as e:
                    logger.error(f"Error calculating market value for {coingecko_id}: {e}")

            holdings_data.append({
                "crypto_id": None,
                "crypto_name": "US Dollar",
                "crypto_symbol": "USD",
                "quantity": user.usd_balance,
                "live_price": 1.0,
                "market_value": user.usd_balance
            })
            total_portfolio_value = total_market_value + user.usd_balance

            # --- Granularity Control ---
            now = datetime.utcnow()
            if valid_timeframes[timeframe]:
                start_time = now - timedelta(hours=valid_timeframes[timeframe])
                total_minutes = (now - start_time).total_seconds() // 60
                interval_minutes = max(1, int(total_minutes // MAX_CHART_POINTS))
            else:
                first_trade = Trade.query.filter_by(user_id=user_id).order_by(Trade.timestamp.asc()).first()
                start_time = first_trade.timestamp if first_trade else now - timedelta(days=30)
                total_minutes = (now - start_time).total_seconds() // 60
                interval_minutes = max(1, int(total_minutes // MAX_CHART_POINTS))

            chart_days = max(1, int((now - start_time).total_seconds() // (60 * 60 * 24)))

            chart_data = []
            time_points = []
            t = start_time
            while t <= now:
                time_points.append(t)
                t += timedelta(minutes=interval_minutes)
            if time_points[-1] < now:
                time_points.append(now)

            coin_histories = {}
            for coingecko_id in coingecko_ids:
                try:
                    prices = fetch_market_chart(coingecko_id, chart_days)
                    coin_histories[coingecko_id] = prices
                except Exception as e:
                    logger.error(f"Error fetching market chart for {coingecko_id}: {e}")
                    coin_histories[coingecko_id] = []

            def get_price_at(prices, dt):
                if not prices:
                    return 0
                ts = int(dt.timestamp() * 1000)
                closest = min(prices, key=lambda x: abs(x[0] - ts))
                return closest[1]

            trades = Trade.query.filter_by(user_id=user_id).order_by(Trade.timestamp.asc()).all()
            for point in time_points:
                try:
                    cash = user.usd_balance
                    coin_quantities = {}
                    for trade in trades:
                        if trade.timestamp > point:
                            break
                        if trade.type == "buy":
                            cash -= trade.price * trade.quantity
                            coin_quantities[trade.crypto_id] = coin_quantities.get(trade.crypto_id, 0) + trade.quantity
                        elif trade.type == "sell":
                            cash += trade.price * trade.quantity
                            coin_quantities[trade.crypto_id] = coin_quantities.get(trade.crypto_id, 0) - trade.quantity

                    value = cash
                    for coingecko_id, holding in holding_map.items():
                        crypto = Crypto.query.filter_by(coingecko_id=coingecko_id).first()
                        if not crypto:
                            continue
                        price = get_price_at(coin_histories.get(coingecko_id, []), point)
                        qty = coin_quantities.get(crypto.id, 0)
                        value += price * qty
                    chart_data.append({
                        "timestamp": point.isoformat(),
                        "portfolio_value": value
                    })
                except Exception as e:
                    logger.error(f"Error reconstructing portfolio at {point}: {e}")

            if len(chart_data) > MAX_CHART_POINTS:
                step = len(chart_data) // MAX_CHART_POINTS
                chart_data = [chart_data[i] for i in range(0, len(chart_data), step)]
                chart_data = chart_data[:MAX_CHART_POINTS]

            if chart_data and chart_data[0]['portfolio_value'] > 0:
                change = (chart_data[-1]['portfolio_value'] - chart_data[0]['portfolio_value']) / chart_data[0]['portfolio_value']
            else:
                change = None

            trades_data = []
            for trade in trades:
                try:
                    crypto = Crypto.query.get(trade.crypto_id)
                    trades_data.append({
                        "trade_id": trade.id,
                        "crypto_id": crypto.id if crypto else None,
                        "crypto_name": crypto.name if crypto else None,
                        "crypto_symbol": crypto.symbol if crypto else None,
                        "type": trade.type,
                        "price": trade.price,
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
                "trades": trades_data
            }, 200

        except Exception as e:
            logger.critical(f"Critical error in dashboard endpoint: {e}", exc_info=True)
            return {"error": "An unexpected error occurred. Please try again later."}, 500


