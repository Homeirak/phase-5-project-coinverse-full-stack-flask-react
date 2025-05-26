from config import db
from datetime import datetime

class PriceCache(db.Model):
    __tablename__ = "price_cache"

    id = db.Column(db.Integer, primary_key=True)
    coingecko_id = db.Column(db.String, nullable=False)
    timestamp = db.Column(db.String, nullable=False)  # e.g., 'YYYY-MM-DD' or 'now'
    price = db.Column(db.PickleType, nullable=False)   # <-- Change from Float to PickleType
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<PriceCache {self.coingecko_id} {self.timestamp} {self.price}>"