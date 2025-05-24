# config.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_restful import Api
from flask_cors import CORS
from dotenv import load_dotenv
import os

# load environment variables
load_dotenv()

# consistent naming convention for Alembic migrations
naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

# flask app initialization
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "devkey")  # default for development
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URI", "sqlite:///app.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
 
# session cookie settings for authentication
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"  # Or "None" if cross-site and using HTTPS
# app.config["SESSION_COOKIE_SECURE"] = True   # Uncomment if using HTTPS

# DB & extensions initialization
metadata = MetaData(naming_convention=naming_convention)
db = SQLAlchemy(app=app, metadata=metadata)
migrate = Migrate(app=app, db=db)
bcrypt = Bcrypt(app=app)  # handles password hashing
api = Api(app=app)        # RESTful API routing

# CORS setup for frontend-backend communication with credentials (cookies)
CORS(
    app,
    supports_credentials=True,
    origins=["http://localhost:3000"]  # Add your frontend URL(s) here
)

