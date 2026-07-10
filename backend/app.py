
from services.supabase_client import supabase
from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "AI Code Review Assistant backend is running!"}

if __name__ == "__main__":
    app.run(debug=True)