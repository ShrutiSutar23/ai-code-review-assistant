import os
from flask import Blueprint, request, jsonify
from services.pylint_service import run_pylint

review_bp = Blueprint("review", __name__)

UPLOAD_FOLDER = "uploads"

@review_bp.route("/review/<filename>", methods=["GET"])
def review_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    pylint_result = run_pylint(filepath)

    return jsonify({
        "filename": filename,
        "pylint": pylint_result
    }), 200