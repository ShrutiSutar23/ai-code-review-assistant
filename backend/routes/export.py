import os
from flask import Blueprint, jsonify, send_file
from services.pylint_service import run_pylint
from services.bandit_service import run_bandit
from services.radon_service import run_radon
from services.openai_service import run_ai_review
from services.export_service import export_as_markdown, export_as_pdf, export_as_html

export_bp = Blueprint("export", __name__)
UPLOAD_FOLDER = "uploads"

def build_report(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(filepath):
        return None

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        code_content = f.read()

    return {
        "pylint": run_pylint(filepath),
        "bandit": run_bandit(filepath),
        "radon": run_radon(filepath),
        "ai_review": run_ai_review(code_content)
    }

@export_bp.route("/export/<filename>/markdown", methods=["GET"])
def export_markdown(filename):
    report_data = build_report(filename)
    if report_data is None:
        return jsonify({"error": "File not found"}), 404

    filepath = export_as_markdown(filename, report_data)
    return send_file(filepath, as_attachment=True)

@export_bp.route("/export/<filename>/pdf", methods=["GET"])
def export_pdf(filename):
    report_data = build_report(filename)
    if report_data is None:
        return jsonify({"error": "File not found"}), 404

    filepath = export_as_pdf(filename, report_data)
    return send_file(filepath, as_attachment=True)

@export_bp.route("/export/<filename>/html", methods=["GET"])
def export_html(filename):
    report_data = build_report(filename)
    if report_data is None:
        return jsonify({"error": "File not found"}), 404

    filepath = export_as_html(filename, report_data)
    return send_file(filepath, as_attachment=True)