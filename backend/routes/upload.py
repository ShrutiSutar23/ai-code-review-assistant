import os
import requests
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


@upload_bp.route("/upload/snippet", methods=["POST"])
def upload_snippet():
    data = request.get_json()
    code = data.get("code")
    filename = data.get("filename", "snippet.py")

    if not code:
        return jsonify({"error": "No code provided"}), 400

    if not is_allowed(filename):
        return jsonify({"error": "File type not supported"}), 400

    save_path = os.path.join(UPLOAD_FOLDER, filename)
    with open(save_path, "w", encoding="utf-8") as f:
        f.write(code)

    return jsonify({"message": "Snippet saved successfully", "filename": filename}), 200

@upload_bp.route("/upload/github", methods=["POST"])
def upload_from_github():
    data = request.get_json()
    url = data.get("url")

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Convert a normal GitHub file URL to a raw URL if needed
    if "github.com" in url and "raw.githubusercontent.com" not in url:
        url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")

    filename = url.split("/")[-1]

    if not is_allowed(filename):
        return jsonify({"error": "File type not supported"}), 400

    try:
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
            return jsonify({"error": "Could not fetch file from GitHub"}), 400

        save_path = os.path.join(UPLOAD_FOLDER, filename)
        with open(save_path, "w", encoding="utf-8") as f:
            f.write(response.text)

        return jsonify({"message": "File fetched from GitHub successfully", "filename": filename}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500