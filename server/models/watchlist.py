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
    target_price = db.Column(db.Float, nullable=True)
    alert_enabled = db.Column(db.Boolean, default=False)

    serialize_rules = (
        '-user.trades',  
        '-user.holdings',
        '-user.watchlists',
        '-crypto.trades',
        '-crypto.holdings',
        '-crypto.watchlists',
    )

    user = db.relationship('User', back_populates='watchlists')
    crypto = db.relationship('Crypto', back_populates='watchlists')
