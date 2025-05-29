from flask import request, session
from flask_restful import Resource
from models import User
from config import db
import logging

logger = logging.getLogger(__name__)

class ProfileResource(Resource):
    def get(self):
        user_id = session.get('user_id')
        if not user_id:
            return {"error": "Unauthorized"}, 401
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404
        return {
            "name": user.name,
            "username": user.user_name,  
            "email": user.email,
            "usd_balance": user.usd_balance,
            "usd_balance_formatted": user.usd_balance_formatted,
            "theme": user.theme or "light",
            "billing_address": user.billing_address,
            "payment_info": user.payment_info,  # e.g. last 4 digits, type, etc.
        }, 200

    def patch(self):
        user_id = session.get('user_id')
        if not user_id:
            return {"error": "Unauthorized"}, 401
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404

        data = request.get_json() or {}

        # Update fields if present in request
        if "name" in data:
            user.name = data["name"]
        if "username" in data:
            user.user_name = data["username"]
        if "email" in data:
            user.email = data["email"]
        if "billing_address" in data:
            user.billing_address = data["billing_address"]
        if "payment_info" in data:
            user.payment_info = data["payment_info"]  
        if "theme" in data:
            user.theme = data["theme"]  

        try:
            db.session.commit()
            # return the full user object, just like in GET
            return {
                "name": user.name,
                "username": user.user_name,
                "email": user.email,
                "usd_balance": user.usd_balance,
                "usd_balance_formatted": user.usd_balance_formatted,
                "theme": user.theme or "light",
                "billing_address": user.billing_address,
                "payment_info": user.payment_info,
            }, 200
        except Exception as e:
            logger.error(f"Error updating profile: {e}", exc_info=True)
            db.session.rollback()
            return {"error": "Failed to update profile"}, 500

    def delete(self):
        user_id = session.get('user_id')
        if not user_id:
            return {"error": "Unauthorized"}, 401
        user = User.query.get(user_id)
        if not user:
            return {"error": "User not found"}, 404

        db.session.delete(user)
        db.session.commit()
        session.clear()  # Log out the user after deletion
        return {"message": "Profile deleted successfully"}, 200

