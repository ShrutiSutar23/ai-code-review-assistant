import subprocess
import json
import sys

def run_pylint(filepath):
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pylint", filepath, "--output-format=json"],
            capture_output=True,
            text=True
        )

        output = result.stdout.strip()

        if not output:
            return {"issues": [], "score": 100}

        issues = json.loads(output)
        score = max(0, 100 - len(issues) * 2)

        return {"issues": issues, "score": score}

    except Exception as e:
        return {"error": str(e)}