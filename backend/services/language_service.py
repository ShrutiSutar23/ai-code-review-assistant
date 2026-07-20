def detect_language(filename):
    ext = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""
    mapping = {
        "py": "python",
        "js": "javascript",
        "ts": "javascript",
        "java": "java",
        "cpp": "cpp",
        "c": "cpp",
    }
    return mapping.get(ext, "unknown")