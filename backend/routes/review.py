import os
from flask import Blueprint, jsonify
from services.pylint_service import run_pylint
from services.bandit_service import run_bandit
from services.radon_service import run_radon

review_bp = Blueprint("review", __name__)

UPLOAD_FOLDER = "uploads"

@review_bp.route("/review/<filename>", methods=["GET"])
def review_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    pylint_result = run_pylint(filepath)
    bandit_result = run_bandit(filepath)
    radon_result = run_radon(filepath)

    return jsonify({
        "filename": filename,
        "pylint": pylint_result,
        "bandit": bandit_result,
        "radon": radon_result
    }), 200