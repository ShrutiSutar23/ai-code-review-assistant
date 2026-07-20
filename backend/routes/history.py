from flask import Blueprint, jsonify, request
from services.supabase_client import supabase

history_bp = Blueprint("history", __name__)

@history_bp.route("/history", methods=["GET"])
def get_history():
    try:
        search = request.args.get("search", "").lower()
        min_score = request.args.get("min_score", type=int)
        max_score = request.args.get("max_score", type=int)

        projects = supabase.table("projects").select("*").order("created_at", desc=True).execute()
        reviews = supabase.table("reviews").select("*").order("created_at", desc=True).execute()

        combined = []
        for review in reviews.data:
            project = next((p for p in projects.data if p["id"] == review["project_id"]), None)
            project_name = project["project_name"] if project else "Unknown"

            if search and search not in project_name.lower():
                continue
            if min_score is not None and review["review_score"] < min_score:
                continue
            if max_score is not None and review["review_score"] > max_score:
                continue

            combined.append({
                "review_id": review["id"],
                "project_name": project_name,
                "review_score": review["review_score"],
                "summary": review["summary"],
                "created_at": review["created_at"]
            })

        return jsonify({"history": combined}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@history_bp.route("/history/<int:review_id>", methods=["DELETE"])
def delete_review(review_id):
    try:
        supabase.table("review_findings").delete().eq("review_id", review_id).execute()
        supabase.table("reviews").delete().eq("id", review_id).execute()
        return jsonify({"message": "Review deleted"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@history_bp.route("/analytics", methods=["GET"])
def get_analytics():
    try:
        reviews = supabase.table("reviews").select("*").order("created_at").execute()
        findings = supabase.table("review_findings").select("*").execute()

        # Score trend over time (chronological)
        score_trend = [
            {"date": r["created_at"][:10], "score": r["review_score"], "id": r["id"]}
            for r in reviews.data
        ]

        # Severity breakdown
        severity_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        issue_type_counts = {}

        for f in findings.data:
            sev = (f.get("severity") or "LOW").upper()
            if sev in severity_counts:
                severity_counts[sev] += 1
            else:
                severity_counts["LOW"] += 1

            issue_type = f.get("issue", "Other")
            issue_type_counts[issue_type] = issue_type_counts.get(issue_type, 0) + 1

        severity_breakdown = [{"name": k, "value": v} for k, v in severity_counts.items()]
        issue_breakdown = [{"name": k, "value": v} for k, v in issue_type_counts.items()]

        avg_score = round(sum(r["review_score"] for r in reviews.data) / len(reviews.data), 1) if reviews.data else 0
        total_reviews = len(reviews.data)
        total_findings = len(findings.data)

        return jsonify({
            "score_trend": score_trend,
            "severity_breakdown": severity_breakdown,
            "issue_breakdown": issue_breakdown,
            "avg_score": avg_score,
            "total_reviews": total_reviews,
            "total_findings": total_findings
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500