import subprocess
import json
import os

def run_eslint(filepath):
    try:
        result = subprocess.run(
            ["npx", "--yes", "eslint", "--no-eslintrc", "--env", "browser,node,es2021",
             "--parser-options=ecmaVersion:2021", "--format", "json", filepath],
            capture_output=True,
            text=True,
            shell=True,
            timeout=30
        )

        output = result.stdout.strip()
        if not output:
            return {"issues": [], "score": 100}

        data = json.loads(output)
        issues = []
        for file_result in data:
            for msg in file_result.get("messages", []):
                issues.append({
                    "line": msg.get("line"),
                    "message": msg.get("message"),
                    "severity": "HIGH" if msg.get("severity") == 2 else "MEDIUM",
                    "rule": msg.get("ruleId"),
                })

        score = max(0, 100 - len(issues) * 3)
        return {"issues": issues, "score": score}

    except Exception as e:
        return {"error": str(e)}