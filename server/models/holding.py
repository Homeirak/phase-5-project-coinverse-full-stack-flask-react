# Holding.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
from config import db

# Models go here
class Holding(db.Model, SerializerMixin):
    __tablename__= "holdings"
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete='CASCADE'))
    crypto_id = db.Column(db.Integer, db.ForeignKey("cryptos.id", ondelete='CASCADE'))
    quantity = db.Column(db.Float)

    serialize_rules = (
        '-user.trades',  
        '-user.holdings',
        '-user.watchlists',
        '-crypto.trades',
        '-crypto.holdings',
        '-crypto.watchlists',
    )

    # Relationships
    user = db.relationship('User', back_populates='holdings')
    crypto = db.relationship('Crypto', back_populates='holdings')

    # 
    @validates('quantity')
    def validate_quantity(self, key, value):
        if value is not None and value < 0:
            raise ValueError("Quantity must be non-negative")
        return value
