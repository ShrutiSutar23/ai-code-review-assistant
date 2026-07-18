from flask import Blueprint, jsonify
from services.supabase_client import supabase

history_bp = Blueprint("history", __name__)

@history_bp.route("/history", methods=["GET"])
def get_history():
    try:
        projects = supabase.table("projects").select("*").order("created_at", desc=True).execute()
        reviews = supabase.table("reviews").select("*").order("created_at", desc=True).execute()

        # Combine project name with its review score/summary
        combined = []
        for review in reviews.data:
            project = next((p for p in projects.data if p["id"] == review["project_id"]), None)
            combined.append({
                "review_id": review["id"],
                "project_name": project["project_name"] if project else "Unknown",
                "review_score": review["review_score"],
                "summary": review["summary"],
                "created_at": review["created_at"]
            })

        return jsonify({"history": combined}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500