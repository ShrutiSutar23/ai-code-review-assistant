import os
from flask import Blueprint, jsonify
from services.pylint_service import run_pylint
from services.bandit_service import run_bandit
from services.radon_service import run_radon
from services.openai_service import run_ai_review
from services.supabase_client import supabase

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

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        code_content = f.read()

    ai_result = run_ai_review(code_content)

    # Save to Supabase (best-effort — won't crash the app if it fails)
    try:
        project_insert = supabase.table("projects").insert({
            "project_name": filename,
            "upload_type": "file"
        }).execute()

        project_id = project_insert.data[0]["id"]

        score = ai_result.get("quality_score", 0) if isinstance(ai_result, dict) else 0
        summary = ai_result.get("summary", "") if isinstance(ai_result, dict) else ""

        supabase.table("reviews").insert({
            "project_id": project_id,
            "review_score": score,
            "summary": summary
        }).execute()

    except Exception as e:
        print("Supabase save failed:", e)

    return jsonify({
        "filename": filename,
        "pylint": pylint_result,
        "bandit": bandit_result,
        "radon": radon_result,
        "ai_review": ai_result
    }), 200