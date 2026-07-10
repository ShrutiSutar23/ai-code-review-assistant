import os
from flask import Blueprint, request, jsonify

upload_bp = Blueprint("upload", __name__)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {".py", ".js", ".java", ".cpp", ".c", ".ts"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def is_allowed(filename):
    ext = os.path.splitext(filename)[1]
    return ext in ALLOWED_EXTENSIONS

@upload_bp.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not is_allowed(file.filename):
        return jsonify({"error": "File type not supported"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)

    return jsonify({"message": "File uploaded successfully", "filename": file.filename}), 200