from flask import Flask
from flask_cors import CORS
from services.supabase_client import supabase
from routes.upload import upload_bp
from routes.review import review_bp
from routes.documentation import documentation_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(upload_bp)
app.register_blueprint(review_bp)
app.register_blueprint(documentation_bp)

@app.route("/")
def home():
    return {"message": "AI Code Review Assistant backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)