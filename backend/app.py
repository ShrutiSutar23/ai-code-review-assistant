from flask import Flask
from flask_cors import CORS
from services.supabase_client import supabase
from routes.upload import upload_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(upload_bp)

@app.route("/")
def home():
    return {"message": "AI Code Review Assistant backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)