import os
from flask import Blueprint, jsonify
from services.openai_service import generate_refactored_code

refactor_bp = Blueprint("refactor", __name__)
UPLOAD_FOLDER = "uploads"

@refactor_bp.route("/refactor/<filename>", methods=["GET"])
def refactor_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        original_code = f.read()

    refactored_code = generate_refactored_code(original_code, filename)

    return jsonify({
        "filename": filename,
        "original_code": original_code,
        "refactored_code": refactored_code
    }), 200