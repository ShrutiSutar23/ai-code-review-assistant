import os
from flask import Blueprint, jsonify
from services.pylint_service import run_pylint
from services.bandit_service import run_bandit
from services.radon_service import run_radon
from services.openai_service import run_ai_review
from services.supabase_client import supabase
from services.metrics_service import get_code_metrics

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
    metrics_result = get_code_metrics(code_content)

    # Save to Supabase (best-effort — won't crash the app if it fails)
    try:
        project_insert = supabase.table("projects").insert({
            "project_name": filename,
            "upload_type": "file"
        }).execute()

        project_id = project_insert.data[0]["id"]

        score = ai_result.get("quality_score", 0) if isinstance(ai_result, dict) else 0
        summary = ai_result.get("summary", "") if isinstance(ai_result, dict) else ""

        review_insert = supabase.table("reviews").insert({
            "project_id": project_id,
            "review_score": score,
            "summary": summary
        }).execute()

        review_id = review_insert.data[0]["id"]

        # --- Populate review_findings ---
        findings = []

        if isinstance(ai_result, dict):
            for bug in ai_result.get("bugs", []):
                findings.append({
                    "review_id": review_id,
                    "severity": "HIGH",
                    "issue": "Bug",
                    "explanation": str(bug),
                    "suggestion": "",
                    "file_name": filename,
                    "line_number": None
                })

            for sec in ai_result.get("security_issues", []):
                findings.append({
                    "review_id": review_id,
                    "severity": "HIGH",
                    "issue": "Security Issue",
                    "explanation": str(sec),
                    "suggestion": "",
                    "file_name": filename,
                    "line_number": None
                })

            for smell in ai_result.get("code_smells", []):
                findings.append({
                    "review_id": review_id,
                    "severity": "MEDIUM",
                    "issue": "Code Smell",
                    "explanation": str(smell),
                    "suggestion": "",
                    "file_name": filename,
                    "line_number": None
                })

        # Add Bandit findings too (these have real line numbers)
        if isinstance(bandit_result, dict) and bandit_result.get("issues"):
            for issue in bandit_result["issues"]:
                findings.append({
                    "review_id": review_id,
                    "severity": issue.get("issue_severity", "LOW"),
                    "issue": "Security (Bandit)",
                    "explanation": issue.get("issue_text", ""),
                    "suggestion": "",
                    "file_name": filename,
                    "line_number": issue.get("line_number")
                })

        if findings:
            supabase.table("review_findings").insert(findings).execute()

    except Exception as e:
        print("Supabase save failed:", e)

    return jsonify({
        "filename": filename,
        "pylint": pylint_result,
        "bandit": bandit_result,
        "radon": radon_result,
        "ai_review": ai_result,
        "metrics": metrics_result
    }), 200