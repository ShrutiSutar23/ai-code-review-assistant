import subprocess
import json
import sys

def run_bandit(filepath):
    try:
        result = subprocess.run(
            [sys.executable, "-m", "bandit", "-f", "json", filepath],
            capture_output=True,
            text=True
        )

        output = result.stdout.strip()

        if not output:
            return {"issues": []}

        data = json.loads(output)
        issues = data.get("results", [])

        return {"issues": issues}

    except Exception as e:
        return {"error": str(e)}