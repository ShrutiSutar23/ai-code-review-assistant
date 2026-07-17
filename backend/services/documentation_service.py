import json
import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-flash-latest")

def generate_documentation(code_content):
    prompt = f"""
You are a senior software engineer writing documentation for a codebase.

Read the following code and generate documentation for it. Return ONLY a valid JSON object
with these exact keys:

- module_summary: a short paragraph describing what this file/module does overall
- functions: a list of objects, each with "name", "description", "parameters" (list of strings), and "returns" (string)
- classes: a list of objects, each with "name" and "description" (empty list if no classes)

Code to document:
{code_content}
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