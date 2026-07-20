# AI Code Review Assistant

An AI-powered full-stack web application that analyzes source code using static analysis tools (Pylint, Bandit, Radon, ESLint) combined with Google Gemini AI to detect bugs, security issues, code smells, and generate documentation — with team collaboration, analytics, and multi-language support.

## Live Features

### Core Analysis
- Upload Python/JavaScript/Java/C++ source files, paste code directly, or import from a GitHub file URL
- Static analysis: Pylint & Bandit & Radon (Python), ESLint (JavaScript)
- Code metrics: classes, functions, total lines, average function length
- AI-powered code review (Gemini): bugs, security issues, code smells, performance suggestions, best practices, refactoring advice, naming suggestions, quality score
- AI-generated documentation: module summaries, function/class docs, README summaries
- AI-powered code refactoring with side-by-side diff view

### Collaboration & History
- Review history with search, score filtering, and delete
- Repository/file comparison with AI-generated verdict and diff view
- Team workspaces: create teams, invite members
- Repository analytics dashboard: score trends, severity breakdowns, issue-type charts

### Account & UX
- Authentication: register, login, logout, password reset, profile update
- GitHub OAuth login
- Dark/light theme toggle
- Interactive Monaco code editor for pasting snippets
- Email notifications after analysis
- Export reports as PDF, Markdown, or HTML

### Engineering
- Dockerized backend and frontend (Dockerfiles + docker-compose)
- CI/CD pipeline via GitHub Actions (build/syntax checks on every push)

## Tech Stack
- **Frontend:** React.js, Monaco Editor, Recharts
- **Backend:** Flask (Python)
- **Database & Auth:** Supabase (PostgreSQL + Auth)
- **AI Model:** Google Gemini API
- **Static Analysis:** Pylint, Bandit, Radon, ESLint
- **DevOps:** Docker, GitHub Actions

## Project Structure
ai-code-review-assistant/
├── .github/workflows/       # CI/CD pipeline
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── Dockerfile
│   ├── routes/               # upload, review, documentation, history, auth, teams, compare, refactor, export
│   ├── services/             # pylint, bandit, radon, eslint, openai (Gemini), supabase, email, metrics, teams
│   └── uploads/
├── frontend/
│   ├── Dockerfile
│   └── src/
│       ├── pages/             # Dashboard, Upload, Paste, GitHub Import, Report, Documentation, History, Auth, Profile, Analytics, Compare, Teams, Refactor
│       ├── components/        # PageHeader, ProtectedRoute
│       └── context/           # ThemeContext
├── docker-compose.yml
└── README.md

## Setup Instructions

### Prerequisites
- Python 3.11+, Node.js 18+, a Supabase project, a Google Gemini API key

### Backend
cd backend
python -m venv venv
venv\Scripts\activate   (Windows) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
Create a `.env` file in `backend/`:
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_ADDRESS=your_gmail_address
EMAIL_APP_PASSWORD=your_gmail_app_password
Run the server:
python app.py

### Frontend
cd frontend
npm install
npm start

### Docker (alternative to manual setup)
docker-compose up --build
Backend: `http://localhost:5000` · Frontend: `http://localhost:3000`

### Database Setup
Run the SQL in Supabase's SQL Editor to create `projects`, `reviews`, `review_findings`, `teams`, and `team_members` tables (see project documentation/commit history for exact schema).

## Known Limitations
- Static analysis (Pylint/Bandit/Radon) is Python-specific; JavaScript uses ESLint; Java/C++ rely on AI review only (no dedicated linter integration)
- GitHub import supports single files via URL, not full repository cloning
- Team member invites are tracked by email; full user-lookup requires Supabase admin API (out of scope for this project's timeline)
- Gemini's free tier has daily/per-minute request limits, which can cause temporary AI review failures under heavy testing

## Demo
[Add screenshots or a link to your demo video here]