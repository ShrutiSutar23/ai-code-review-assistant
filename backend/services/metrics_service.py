import ast

def get_code_metrics(code_content):
    try:
        tree = ast.parse(code_content)

        functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
        classes = [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]

        total_lines = len(code_content.splitlines())

        function_lengths = []
        for fn in functions:
            if hasattr(fn, "end_lineno"):
                length = fn.end_lineno - fn.lineno + 1
                function_lengths.append(length)

        avg_function_length = (
            round(sum(function_lengths) / len(function_lengths), 1)
            if function_lengths else 0
        )

        return {
            "num_classes": len(classes),
            "num_functions": len(functions),
            "total_lines": total_lines,
            "avg_function_length": avg_function_length
        }

    except Exception as e:
        return {"error": str(e)}