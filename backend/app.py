from flask import Flask
from flask_cors import CORS
from services.supabase_client import supabase
from routes.upload import upload_bp
from routes.review import review_bp
from routes.documentation import documentation_bp
from routes.history import history_bp
from routes.auth import auth_bp
from routes.export import export_bp
from routes.refactor import refactor_bp
from routes.compare import compare_bp


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB limit
CORS(app)

app.register_blueprint(upload_bp)
app.register_blueprint(review_bp)
app.register_blueprint(documentation_bp)
app.register_blueprint(history_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(export_bp)
app.register_blueprint(refactor_bp)
app.register_blueprint(compare_bp)

@app.route("/")
def home():
    return {"message": "AI Code Review Assistant backend is running!"}

@app.errorhandler(404)
def not_found(e):
    return {"error": "Route not found"}, 404

@app.errorhandler(500)
def server_error(e):
    return {"error": "Something went wrong on the server"}, 500

@app.errorhandler(413)
def file_too_large(e):
    return {"error": "File is too large (max 5MB)"}, 413

if __name__ == "__main__":
    app.run(debug=True)