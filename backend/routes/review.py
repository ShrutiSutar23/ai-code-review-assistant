import os
from flask import Blueprint, jsonify
from services.pylint_service import run_pylint
from services.bandit_service import run_bandit
from services.radon_service import run_radon
from services.openai_service import run_ai_review
from services.supabase_client import supabase
from services.metrics_service import get_code_metrics, get_generic_metrics
from services.language_service import detect_language
from services.eslint_service import run_eslint

review_bp = Blueprint("review", __name__)

UPLOAD_FOLDER = "uploads"

@review_bp.route("/review/<filename>", methods=["GET"])
def review_file(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    language = detect_language(filename)

    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        code_content = f.read()

    # Static analysis - varies by language
    if language == "python":
        pylint_result = run_pylint(filepath)
        bandit_result = run_bandit(filepath)
        radon_result = run_radon(filepath)
        metrics_result = get_code_metrics(code_content)
    elif language == "javascript":
        pylint_result = run_eslint(filepath)  # reuse the same JSON "shape" as pylint
        bandit_result = {"issues": [], "note": "Security scanning (Bandit) is Python-specific; not run for JavaScript."}
        radon_result = {"complexity": {}, "maintainability": {}, "note": "Radon is Python-specific; complexity not available for JavaScript."}
        metrics_result = get_generic_metrics(code_content, language)
    else:
        # Java, C++, or unknown - static analysis tools not set up; rely on AI review
        pylint_result = {"issues": [], "score": None, "note": f"Static analysis not available for {language}; see AI Review tab."}
        bandit_result = {"issues": [], "note": f"Security scanning not available for {language}; see AI Review tab."}
        radon_result = {"complexity": {}, "maintainability": {}, "note": f"Complexity analysis not available for {language}; see AI Review tab."}
        metrics_result = get_generic_metrics(code_content, language)

    ai_result = run_ai_review(code_content)

    # Save to Supabase (best-effort)
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

        findings = []
        if isinstance(ai_result, dict):
            for bug in ai_result.get("bugs", []):
                findings.append({"review_id": review_id, "severity": "HIGH", "issue": "Bug", "explanation": str(bug), "suggestion": "", "file_name": filename, "line_number": None})
            for sec in ai_result.get("security_issues", []):
                findings.append({"review_id": review_id, "severity": "HIGH", "issue": "Security Issue", "explanation": str(sec), "suggestion": "", "file_name": filename, "line_number": None})
            for smell in ai_result.get("code_smells", []):
                findings.append({"review_id": review_id, "severity": "MEDIUM", "issue": "Code Smell", "explanation": str(smell), "suggestion": "", "file_name": filename, "line_number": None})

        if isinstance(pylint_result, dict) and pylint_result.get("issues"):
            for issue in pylint_result["issues"]:
                if "issue_severity" in issue:  # bandit-style
                    continue
                findings.append({"review_id": review_id, "severity": issue.get("severity", "LOW"), "issue": "Static Analysis", "explanation": issue.get("message", ""), "suggestion": "", "file_name": filename, "line_number": issue.get("line")})

        if isinstance(bandit_result, dict) and bandit_result.get("issues"):
            for issue in bandit_result["issues"]:
                findings.append({"review_id": review_id, "severity": issue.get("issue_severity", "LOW"), "issue": "Security (Bandit)", "explanation": issue.get("issue_text", ""), "suggestion": "", "file_name": filename, "line_number": issue.get("line_number")})

        if findings:
            supabase.table("review_findings").insert(findings).execute()

    except Exception as e:
        print("Supabase save failed:", e)

    try:
        user_email = request.headers.get("X-User-Email") if 'request' in dir() else None
    except Exception:
        user_email = None

    return jsonify({
        "filename": filename,
        "language": language,
        "pylint": pylint_result,
        "bandit": bandit_result,
        "radon": radon_result,
        "ai_review": ai_result,
        "metrics": metrics_result
    }), 200