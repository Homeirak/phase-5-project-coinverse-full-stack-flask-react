# Crypto.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class Crypto(db.Model, SerializerMixin):
    __tablename__= "cryptos"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    symbol = db.Column(db.String, nullable=True)
    image_url = db.Column(db.String, nullable=False)
    price = db.Column(db.Float)

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