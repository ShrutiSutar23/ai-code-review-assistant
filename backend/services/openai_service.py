import json
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-flash-latest")

def run_ai_review(code_content):
    prompt = f"""
You are an experienced Senior Software Engineer.

Review the following code and provide a COMPLETE analysis. You MUST include every single key listed below, even if a section has nothing to report. If a section is empty, use an empty list [] or empty object {{}} - never omit the key entirely.

Return ONLY a valid JSON object with EXACTLY these keys:
- bugs: list of strings
- security_issues: list of strings
- code_smells: list of strings
- complexity_analysis: object with keys "cyclomatic_complexity", "cognitive_complexity", "time_complexity", "space_complexity"
- performance_improvements: list of strings
- best_practices: list of strings
- refactoring_suggestions: list of strings
- naming_suggestions: object with exactly two keys "functions" and "variables", each an object mapping old names to suggested better names. If there are no naming issues, still return "naming_suggestions" as {{"functions": {{}}, "variables": {{}}}}.
- quality_score: integer from 0 to 100
- summary: a short string

Do not add extra keys. Do not skip any key above, even if empty.

Code to review:
{code_content}
"""

    try:
        response = model.generate_content(prompt)
        raw_output = response.text.strip()

        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            raw_output = raw_output.replace("json", "", 1).strip()

        result = json.loads(raw_output)

        if "naming_suggestions" not in result or not isinstance(result.get("naming_suggestions"), dict):
            result["naming_suggestions"] = {"functions": {}, "variables": {}}

        return result

    except Exception as e:
        return {"error": str(e)}