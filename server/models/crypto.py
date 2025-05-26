# Crypto.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class Crypto(db.Model, SerializerMixin):
    __tablename__= "cryptos"
    
    id = db.Column(db.Integer, primary_key=True)
    coingecko_id = db.Column(db.String, nullable=True)
    name = db.Column(db.String, nullable=False)
    symbol = db.Column(db.String, nullable=False)
    image_url = db.Column(db.String, nullable=True)
    current_price = db.Column(db.Float)
    market_cap = db.Column(db.Float)

    serialize_rules = (
        '-trades.user', 
        '-trades.crypto', 
        '-holdings.user',
        '-holdings.crypto',
        '-watchlists.user', 
        '-watchlists.crypto', 
    )  

    # One-to-many relationships
    trades = db.relationship('Trade', back_populates='crypto', cascade="all, delete-orphan")
    holdings = db.relationship('Holding', back_populates='crypto', cascade="all, delete-orphan")
    watchlists = db.relationship('Watchlist', back_populates='crypto', cascade="all, delete-orphan")

    # validations
    @validates('name', 'image_url')
    def validate_not_empty(self, key, value):
        if not value:
            raise ValueError(f"{key} must not be empty")
        return value

    @validates('price')
    def validate_price(self, key, value):
        if value is not None and value < 0:
            raise ValueError("Price must be non-negative")
        return value