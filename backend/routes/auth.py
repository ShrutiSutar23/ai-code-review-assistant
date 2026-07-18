from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user, logout_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    result = register_user(email, password)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200

@auth_bp.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    result = login_user(email, password)
    if "error" in result:
        return jsonify(result), 401
    return jsonify(result), 200

@auth_bp.route("/auth/logout", methods=["POST"])
def logout():
    result = logout_user()
    return jsonify(result), 200