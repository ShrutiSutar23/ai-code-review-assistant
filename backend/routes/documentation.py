import os
from flask import Blueprint, jsonify
from services.documentation_service import generate_documentation

documentation_bp = Blueprint("documentation", __name__)

UPLOAD_FOLDER = "uploads"

@documentation_bp.route("/documentation/<filename>", methods=["GET"])
def get_documentation(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        code_content = f.read()

    doc_result = generate_documentation(code_content)

    return jsonify({
        "filename": filename,
        "documentation": doc_result
    }), 200