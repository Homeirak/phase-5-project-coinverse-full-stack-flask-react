import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from datetime import datetime
from config import db
from models import User, Holding, Crypto, PortfolioSnapshot

def generate_portfolio_snapshots():
    """Generate and save a portfolio snapshot for each user."""
    users = User.query.all()
    now = datetime.utcnow()

    for user in users:
        holdings = Holding.query.filter_by(user_id=user.id).all()
        snapshot_holdings = []
        total_value = user.usd_balance

        for holding in holdings:
            crypto = Crypto.query.get(holding.crypto_id)
            if not crypto or not crypto.coingecko_id:
                continue
            # Fetch live price (could be improved with caching/batching)
            import requests
            url = f"https://api.coingecko.com/api/v3/simple/price?ids={crypto.coingecko_id}&vs_currencies=usd"
            try:
                resp = requests.get(url, timeout=10)
                price = resp.json().get(crypto.coingecko_id, {}).get('usd', 0)
            except Exception:
                price = 0
            value = price * holding.quantity
            total_value += value
            snapshot_holdings.append({
                "crypto_id": crypto.id,
                "crypto_name": crypto.name,
                "crypto_symbol": crypto.symbol,
                "quantity": holding.quantity,
                "price": price,
                "market_value": value
            })

        # Save snapshot
        snapshot = PortfolioSnapshot(
            user_id=user.id,
            timestamp=now,
            total_value=total_value,
            holdings_json=snapshot_holdings
        )
        db.session.add(snapshot)

    db.session.commit()
    print(f"Portfolio snapshots generated at {now.isoformat()}.")

if __name__ == "__main__":
    from config import app
    with app.app_context():
        generate_portfolio_snapshots()