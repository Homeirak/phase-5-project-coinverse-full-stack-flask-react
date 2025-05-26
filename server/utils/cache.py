from models.price_cache import PriceCache
from config import db
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

CACHE_EXPIRY_MINUTES = 60  # Adjust as needed

def get_price_from_cache(coingecko_id, timestamp="now", allow_stale=False):
    cache_entry = PriceCache.query.filter_by(coingecko_id=coingecko_id, timestamp=timestamp).first()
    if cache_entry:
        if allow_stale or cache_entry.updated_at > datetime.utcnow() - timedelta(minutes=CACHE_EXPIRY_MINUTES):
            logger.info(f"Cache hit for {coingecko_id} at {timestamp}")
            return cache_entry.price
    return None

def set_price_in_cache(coingecko_id, price, timestamp="now"):
    cache_entry = PriceCache.query.filter_by(coingecko_id=coingecko_id, timestamp=timestamp).first()
    if cache_entry:
        cache_entry.price = price
        cache_entry.updated_at = datetime.utcnow()
    else:
        cache_entry = PriceCache(
            coingecko_id=coingecko_id,
            timestamp=timestamp,
            price=price,
            updated_at=datetime.utcnow()
        )
        db.session.add(cache_entry)
    db.session.commit()