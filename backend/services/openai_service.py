import json
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-flash-latest")

def run_ai_review(code_content):
    prompt = f"""
You are an experienced Senior Software Engineer.

Review the following code and provide:
1. Bugs found
2. Security issues
3. Code smells
4. Complexity analysis
5. Performance improvements
6. Best practices
7. Suggested refactoring
8. Better variable/function names
9. Code quality score out of 100
10. Summary of improvements

Return ONLY a valid JSON object with these exact keys:
bugs, security_issues, code_smells, complexity_analysis, performance_improvements,
best_practices, refactoring_suggestions, naming_suggestions, quality_score, summary

Code to review:
{code_content}
"""

    try:
        response = model.generate_content(prompt)
        raw_output = response.text.strip()

        # Clean up in case the model wraps it in ```json ... ```
        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            raw_output = raw_output.replace("json", "", 1).strip()

        result = json.loads(raw_output)
        return result

    except Exception as e:
        return {"error": str(e)}