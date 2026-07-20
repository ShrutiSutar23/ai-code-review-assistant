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
    
def generate_refactored_code(code_content, filename):
    prompt = f"""
You are an expert software engineer. Rewrite the following code to fix all bugs, security issues, and code smells, while preserving the original intent as closely as possible unless the original logic is clearly broken.

Rules:
- Return ONLY the corrected code itself.
- Do NOT include any explanation, markdown formatting, backticks, or comments about what you changed.
- Keep the same overall structure and function/class names where reasonable, unless renaming clearly improves clarity.
- The output must be valid, runnable code in the same language as the input.

Filename: {filename}

Original code:
{code_content}
"""

    try:
        response = model.generate_content(prompt)
        refactored = response.text.strip()

        # Clean up in case the model wraps it in ``` fences anyway
        if refactored.startswith("```"):
            lines = refactored.split("\n")
            lines = lines[1:] if lines[0].startswith("```") else lines
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            refactored = "\n".join(lines)

        return refactored
    except Exception as e:
        return f"# Error generating refactored code: {str(e)}"
    
def compare_code_files(code_a, filename_a, code_b, filename_b):
    prompt = f"""
You are a senior software engineer comparing two code files.

File 1: {filename_a}
{code_a}

File 2: {filename_b}
{code_b}

Compare these two files and return ONLY a valid JSON object with these exact keys:
- similarity_summary: a short paragraph describing how similar or different the two files are overall
- key_differences: list of strings describing the most important differences (logic, structure, quality)
- which_is_better: one of "file1", "file2", or "similar", based on code quality
- reasoning: a short explanation for the which_is_better choice
- shared_patterns: list of strings describing anything the two files have in common (patterns, bugs, style)

Do not add extra keys. Do not skip any key, even if empty (use "" or [] as appropriate).
"""

    try:
        response = model.generate_content(prompt)
        raw_output = response.text.strip()

        if raw_output.startswith("```"):
            raw_output = raw_output.strip("`")
            raw_output = raw_output.replace("json", "", 1).strip()

        result = json.loads(raw_output)
        return result

    except Exception as e:
        return {"error": str(e)}