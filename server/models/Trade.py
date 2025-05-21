# Trade.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class Trade(db.Model, SerializerMixin):
    __tablename__= "trades"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete='CASCADE'))
    crypto_id = db.Column(db.Integer, db.ForeignKey("cryptos.id", ondelete='CASCADE'))
    type = db.Column(db.String, nullable=False)  # "buy" or "sell"
    price = db.Column(db.Float)
    quantity = db.Column(db.Float)
    timestamp = db.Column(db.DateTime, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='trades')
    crypto = db.relationship('Crypto', back_populates='trades')

    # Validations
    @validates('type')
    def validate_type(self, key, value):
        if value not in ['buy', 'sell']:
            raise ValueError("Type must be 'buy' or 'sell'")
        return value

    @validates('price', 'quantity')
    def validate_positive(self, key, value):
        if value is not None and value < 0:
            raise ValueError(f"{key.capitalize()} must be non-negative")
        return value