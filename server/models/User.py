# User.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class User(db.Model, SerializerMixin):
    __tablename__= "users"
    
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, nullable=False)
    usd_balance = db.Column(db.Float)

    # Relationships
    trades = db.relationship('Trade', back_populates='user', cascade="all, delete-orphan")
    holdings = db.relationship('Holding', back_populates='user', cascade="all, delete-orphan")
    watchlists = db.relationship('Watchlist', back_populates='user', cascade="all, delete-orphan")

    # Validations
    @validates('user_name', 'email')
    def validate_not_empty(self, key, value):
        if not value:
            raise ValueError(f"{key} must not be empty")
        return value

    @validates('usd_balance')
    def validate_usd_balance(self, key, value):
        if value is not None and value < 0:
            raise ValueError("USD balance must be non-negative")
        return value