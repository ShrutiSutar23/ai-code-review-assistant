# Write or paste def run_ai_review(code_content):
    prompt = f"""
You are an experienced Senior Software Engineer.

Review the following code and provide a COMPLETE analysis...
Return ONLY a valid JSON object with EXACTLY these keys:
- bugs, security_issues, code_smells, ...

Code to review:
{code_content}
"""
    response = model.generate_content(prompt)
your Python code here
