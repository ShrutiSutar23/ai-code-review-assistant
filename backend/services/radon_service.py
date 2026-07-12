import subprocess
import json
import sys

def run_radon(filepath):
    try:
        # Cyclomatic Complexity
        cc_result = subprocess.run(
            [sys.executable, "-m", "radon", "cc", filepath, "-j"],
            capture_output=True,
            text=True
        )
        complexity = json.loads(cc_result.stdout) if cc_result.stdout.strip() else {}

        # Maintainability Index
        mi_result = subprocess.run(
            [sys.executable, "-m", "radon", "mi", filepath, "-j"],
            capture_output=True,
            text=True
        )
        maintainability = json.loads(mi_result.stdout) if mi_result.stdout.strip() else {}

        return {
            "complexity": complexity,
            "maintainability": maintainability
        }

    except Exception as e:
        return {"error": str(e)}