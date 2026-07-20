import os
from flask import Blueprint, jsonify
from services.openai_service import compare_code_files

compare_bp = Blueprint("compare", __name__)
UPLOAD_FOLDER = "uploads"

@compare_bp.route("/compare/<filename_a>/<filename_b>", methods=["GET"])
def compare_files(filename_a, filename_b):
    filepath_a = os.path.join(UPLOAD_FOLDER, filename_a)
    filepath_b = os.path.join(UPLOAD_FOLDER, filename_b)

    if not os.path.exists(filepath_a):
        return jsonify({"error": f"File not found: {filename_a}"}), 404
    if not os.path.exists(filepath_b):
        return jsonify({"error": f"File not found: {filename_b}"}), 404

    with open(filepath_a, "r", encoding="utf-8", errors="ignore") as f:
        code_a = f.read()
    with open(filepath_b, "r", encoding="utf-8", errors="ignore") as f:
        code_b = f.read()

    comparison = compare_code_files(code_a, filename_a, code_b, filename_b)

    return jsonify({
        "filename_a": filename_a,
        "filename_b": filename_b,
        "code_a": code_a,
        "code_b": code_b,
        "comparison": comparison
    }), 200