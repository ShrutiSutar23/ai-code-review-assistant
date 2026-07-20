import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import EMAIL_ADDRESS, EMAIL_APP_PASSWORD

def send_analysis_email(to_email, filename, score, summary):
    if not EMAIL_ADDRESS or not EMAIL_APP_PASSWORD:
        print("Email credentials not configured, skipping email.")
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = EMAIL_ADDRESS
        msg["To"] = to_email
        msg["Subject"] = f"Code Review Complete: {filename}"

        body = f"""
Hi,

Your code review for "{filename}" is complete.

Quality Score: {score}/100

Summary:
{summary}

Log in to your AI Code Review Assistant dashboard to see the full report.

- AI Code Review Assistant
"""
        msg.attach(MIMEText(body, "plain"))

        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_APP_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, to_email, msg.as_string())
        server.quit()

        return True
    except Exception as e:
        print("Failed to send email:", e)
        return False