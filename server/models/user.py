# User.py
import re
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import validates
from sqlalchemy_serializer import SerializerMixin
from config import db, bcrypt
from sqlalchemy.ext.hybrid import hybrid_property

class User(db.Model, SerializerMixin):
    __tablename__ = "users"
    
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String, unique=True, nullable=False)
    _password_hash = db.Column("password_hash", db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    usd_balance = db.Column(db.Float, default=0.0)

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hash is not accessible.")

    @password_hash.setter
    def password_hash(self, password):
        self._password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self._password_hash, password)

    # serialization rules
    # excludes password hash from serialization
    # password has only a field in the user model
    serialize_rules = (
        '-_password_hash', 
        '-password_hash', 
        '-trades.user', 
        '-trades.crypto', 
        '-holdings.user',
        '-holdings.crypto',
        '-watchlists.user', 
        '-watchlists.crypto', 
    )  

    # Relationships
    trades = db.relationship('Trade', back_populates='user', cascade="all, delete-orphan")
    holdings = db.relationship('Holding', back_populates='user', cascade="all, delete-orphan")
    watchlists = db.relationship('Watchlist', back_populates='user', cascade="all, delete-orphan")

    # Validations
    @validates('user_name')
    def validate_user_name(self, key, value):
        if not value or len(value) < 3:
            raise ValueError("Username must be at least 3 characters")
        if not value.isalnum():
            raise ValueError("Username must be alphanumeric")
        return value

    @validates('email')
    def validate_email(self, key, value):
        if not value:
            raise ValueError("Email must not be empty")
        email_regex = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(email_regex, value):
            raise ValueError("Invalid email format")
        return value

    @validates('usd_balance')
    def validate_usd_balance(self, key, value):
        if value is not None and value < 0:
            raise ValueError("USD balance must be non-negative")
        return value