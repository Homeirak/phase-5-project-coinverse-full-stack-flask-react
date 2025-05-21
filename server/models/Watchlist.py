# Watchlist.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class Watchlist(db.Model, SerializerMixin):
    __tablename__= "watchlists"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete='CASCADE'))
    crypto_id = db.Column(db.Integer, db.ForeignKey("cryptos.id", ondelete='CASCADE'))
    quantity = db.Column(db.Float)

    # Relationships
    user = db.relationship('User', back_populates='watchlists')
    crypto = db.relationship('Crypto', back_populates='watchlists')

    # Validations
    @validates('quantity')
    def validate_quantity(self, key, value):
        if value is not None and value < 0:
            raise ValueError("Quantity must be non-negative")
        return value
