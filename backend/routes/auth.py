from flask import Blueprint, request, jsonify
from services.auth_service import register_user, login_user, logout_user, request_password_reset, update_password, update_profile, get_profile

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

@auth_bp.route("/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    result = request_password_reset(email)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200


@auth_bp.route("/auth/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    access_token = data.get("access_token")
    new_password = data.get("new_password")

    if not access_token or not new_password:
        return jsonify({"error": "Access token and new password required"}), 400

    result = update_password(access_token, new_password)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200

@auth_bp.route("/auth/profile", methods=["GET"])
def profile():
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return jsonify({"error": "No access token provided"}), 401

    result = get_profile(access_token)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200


@auth_bp.route("/auth/profile", methods=["PUT"])
def update_profile_route():
    access_token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not access_token:
        return jsonify({"error": "No access token provided"}), 401

    data = request.get_json()
    name = data.get("name")
    email = data.get("email")

    result = update_profile(access_token, name=name, email=email)
    if "error" in result:
        return jsonify(result), 400
    return jsonify(result), 200