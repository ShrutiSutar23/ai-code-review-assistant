import { useState } from "react";
import axios from "axios";

function ReportPage() {
  const [filename, setFilename] = useState("");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setError("");
    setReport(null);

    if (!filename) {
      setError("Please enter a filename (e.g., test.py)");
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:5000/review/${filename}`);
      setReport(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Code Analysis Report</h1>

      <input
        type="text"
        placeholder="Enter filename (e.g. test.py)"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        style={{ padding: "8px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={fetchReport} style={{ padding: "8px 16px" }}>
        Get Report
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {report && (
        <div style={{ marginTop: "30px" }}>
          <h2>Results for: {report.filename}</h2>

          {/* Pylint Section */}
          <div style={cardStyle}>
            <h3>Code Quality (Pylint)</h3>
            <p><strong>Score:</strong> {report.pylint.score ?? "N/A"} / 100</p>
            {report.pylint.issues && report.pylint.issues.length > 0 ? (
              <ul>
                {report.pylint.issues.map((issue, i) => (
                  <li key={i}>
                    Line {issue.line}: {issue.message} ({issue["message-id"]})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No issues found.</p>
            )}
          </div>

          {/* Bandit Section */}
          <div style={cardStyle}>
            <h3>Security Issues (Bandit)</h3>
            {report.bandit.issues && report.bandit.issues.length > 0 ? (
              <ul>
                {report.bandit.issues.map((issue, i) => (
                  <li key={i} style={{ color: severityColor(issue.issue_severity) }}>
                    <strong>{issue.issue_severity}</strong> (Line {issue.line_number}): {issue.issue_text}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No security issues found.</p>
            )}
          </div>

          {/* Radon Section */}
          <div style={cardStyle}>
            <h3>Complexity & Maintainability (Radon)</h3>
            {report.radon.complexity && Object.keys(report.radon.complexity).length > 0 ? (
              Object.entries(report.radon.complexity).map(([file, functions]) => (
                <div key={file}>
                  {functions.map((fn, i) => (
                    <p key={i}>
                      Function <strong>{fn.name}</strong>: complexity {fn.complexity} (rank {fn.rank})
                    </p>
                  ))}
                </div>
              ))
            ) : (
              <p>No complexity data.</p>
            )}

            {report.radon.maintainability && Object.entries(report.radon.maintainability).map(([file, data]) => (
              <p key={file}>
                Maintainability Index: {data.mi?.toFixed(1)} (rank {data.rank})
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "16px",
  backgroundColor: "#fafafa",
};

function severityColor(severity) {
  if (severity === "HIGH") return "red";
  if (severity === "MEDIUM") return "orange";
  return "#555";
}

export default ReportPage;