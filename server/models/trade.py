# Trade.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class Trade(db.Model, SerializerMixin):
    __tablename__ = "trades"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    crypto_id = db.Column(db.Integer, db.ForeignKey('cryptos.id'))
    action = db.Column(db.String)  # "buy" or "sell"
    quantity = db.Column(db.Float)  # changed from amount
    price_at_trade = db.Column(db.Float)
    order_type = db.Column(db.String)  # "market", "limit", "stop-limit"
    limit_price = db.Column(db.Float)
    stop_price = db.Column(db.Float)
    status = db.Column(db.String)  # "pending", "filled", etc.
    timestamp = db.Column(db.DateTime)

    serialize_rules = (
        '-user.trades',  
        '-user.holdings',
        '-user.watchlists',
        '-crypto.trades',
        '-crypto.holdings',
        '-crypto.watchlists',
    )

    # Relationships
    user = db.relationship('User', back_populates='trades')
    crypto = db.relationship('Crypto', back_populates='trades')

    # Validations
    @validates('action')
    def validate_action(self, key, value):
        if value not in ['buy', 'sell']:
            raise ValueError("Action must be 'buy' or 'sell'")
        return value

    @validates('quantity', 'price_at_trade', 'limit_price', 'stop_price')  # changed from amount
    def validate_positive(self, key, value):
        if value is not None and value < 0:
            raise ValueError(f"{key.capitalize()} must be non-negative")
        return value