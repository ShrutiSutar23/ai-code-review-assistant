import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

REPORTS_FOLDER = "reports"
os.makedirs(REPORTS_FOLDER, exist_ok=True)

def export_as_markdown(filename, report_data):
    lines = [f"# Code Review Report: {filename}\n"]

    lines.append(f"## Pylint Score: {report_data['pylint'].get('score', 'N/A')}/100\n")

    ai = report_data.get("ai_review", {})
    if isinstance(ai, dict) and not ai.get("error"):
        lines.append(f"## AI Quality Score: {ai.get('quality_score', 'N/A')}/100\n")
        lines.append(f"**Summary:** {ai.get('summary', '')}\n")

        for section in ["bugs", "security_issues", "code_smells", "best_practices", "refactoring_suggestions"]:
            items = ai.get(section, [])
            if items:
                lines.append(f"\n### {section.replace('_', ' ').title()}")
                for item in items:
                    lines.append(f"- {item}")

    content = "\n".join(lines)
    filepath = os.path.join(REPORTS_FOLDER, f"{filename}_report.md")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    return filepath


def export_as_pdf(filename, report_data):
    filepath = os.path.join(REPORTS_FOLDER, f"{filename}_report.pdf")
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter
    y = height - 50

    def write_line(text, size=11, gap=16):
        nonlocal y
        if y < 50:
            c.showPage()
            y = height - 50
        c.setFont("Helvetica", size)
        c.drawString(50, y, text[:110])
        y -= gap

    write_line(f"Code Review Report: {filename}", size=16, gap=30)
    write_line(f"Pylint Score: {report_data['pylint'].get('score', 'N/A')}/100")

    ai = report_data.get("ai_review", {})
    if isinstance(ai, dict) and not ai.get("error"):
        write_line(f"AI Quality Score: {ai.get('quality_score', 'N/A')}/100")
        write_line(f"Summary: {ai.get('summary', '')}")

        for section in ["bugs", "security_issues", "code_smells", "best_practices", "refactoring_suggestions"]:
            items = ai.get(section, [])
            if items:
                write_line("")
                write_line(section.replace("_", " ").title(), size=13)
                for item in items:
                    write_line(f"- {item}")

    c.save()
    return filepath

def export_as_html(filename, report_data):
    ai = report_data.get("ai_review", {})
    pylint_score = report_data['pylint'].get('score', 'N/A')

    def render_list(title, items, color):
        if not items:
            return ""
        list_items = "".join(f"<li>{item}</li>" for item in items)
        return f'<h3 style="color:{color};">{title}</h3><ul>{list_items}</ul>'

    ai_section = ""
    if isinstance(ai, dict) and not ai.get("error"):
        ai_section = f"""
        <h2>AI Quality Score: {ai.get('quality_score', 'N/A')}/100</h2>
        <p><strong>Summary:</strong> {ai.get('summary', '')}</p>
        {render_list("🐞 Bugs", ai.get("bugs", []), "#dc2626")}
        {render_list("🔒 Security Issues", ai.get("security_issues", []), "#dc2626")}
        {render_list("👃 Code Smells", ai.get("code_smells", []), "#d97706")}
        {render_list("⚡ Performance Improvements", ai.get("performance_improvements", []), "#2563eb")}
        {render_list("✅ Best Practices", ai.get("best_practices", []), "#16a34a")}
        {render_list("🔧 Refactoring Suggestions", ai.get("refactoring_suggestions", []), "#2563eb")}
        """

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Code Review Report - {filename}</title>
        <style>
            body {{ font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }}
            h1 {{ border-bottom: 2px solid #ddd; padding-bottom: 10px; }}
            h2 {{ margin-top: 24px; }}
            ul {{ padding-left: 20px; }}
            li {{ margin-bottom: 6px; }}
        </style>
    </head>
    <body>
        <h1>Code Review Report: {filename}</h1>
        <h2>Pylint Score: {pylint_score}/100</h2>
        {ai_section}
    </body>
    </html>
    """

    filepath = os.path.join(REPORTS_FOLDER, f"{filename}_report.html")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)

    return filepath