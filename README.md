# AI Code Review Assistant

An AI-powered web application that analyzes source code using static analysis tools (Pylint, Bandit, Radon) combined with an AI model (Google Gemini) to detect bugs, security issues, code smells, and generate documentation.

## Features Implemented
- Upload Python source code files
- Static code analysis:
  - Pylint (code quality score, issues)
  - Bandit (security vulnerability scanning)
  - Radon (cyclomatic complexity, maintainability index)
- Code metrics: number of classes, functions, total lines, average function length
- AI-powered code review (bugs, security issues, code smells, performance suggestions, best practices, refactoring advice, naming suggestions, quality score)
- AI-generated documentation (module summary, function docs, class docs)
- Review history with search, score filtering, and delete
- All reviews and findings saved to a Supabase (PostgreSQL) database

## Tech Stack
- **Frontend:** React.js
- **Backend:** Flask (Python)
- **Database:** Supabase (PostgreSQL)
- **AI Model:** Google Gemini API
- **Static Analysis:** Pylint, Bandit, Radon

## Project Structure
ai-code-review-assistant/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── routes/
│   ├── services/
│   └── uploads/
├── frontend/
│   └── src/
│       └── pages/
└── README.md

## Setup Instructions

### Backend
cd backend
python -m venv venv
venv\Scripts\activate   (Windows) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
Create a `.env` file in `backend/` with:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
Run the server:
python app.py

### Frontend
cd frontend
npm install
npm start
