import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "pylint", label: "Code Quality" },
  { key: "security", label: "Security" },
  { key: "complexity", label: "Complexity" },
  { key: "ai", label: "AI Review" },
];

function ReportPage() {
  const { colors } = useTheme();
  const [searchParams] = useSearchParams();
  const [filename, setFilename] = useState(searchParams.get("file") || "");
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [fileList, setFileList] = useState([]);

  const fetchReport = useCallback(async (fname) => {
    setError("");
    setReport(null);
    if (!fname) {
      setError("Please enter a filename (e.g., test.py)");
      return;
    }
    setLoading(true);
    try {
      const userEmail = localStorage.getItem("user_email") || "";
      const response = await axios.get(`http://127.0.0.1:5000/review/${fname}`, {
        headers: { "X-User-Email": userEmail }
      });
      setReport(response.data);
      setActiveTab("overview");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fileParam = searchParams.get("file");
    if (fileParam) {
      setFilename(fileParam);
      fetchReport(fileParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/files")
      .then((res) => setFileList(res.data.files || []))
      .catch(() => {});
  }, []);

  const banditCount = report?.bandit?.issues?.length || 0;
  const pylintScore = report?.pylint?.score ?? "N/A";
  const aiScore = report?.ai_review?.quality_score ?? "N/A";
  const maintainability = report?.radon?.maintainability
    ? Object.values(report.radon.maintainability)[0]
    : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/review" title="Code Analysis Report" subtitle="Pylint · Bandit · Radon · AI review, all in one place." />

        <div style={styles.searchRow}>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                setFilename(e.target.value);
                fetchReport(e.target.value);
              }
            }}
            style={{ ...styles.textInput, maxWidth: "220px", backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          >
            <option value="">📁 Choose a file...</option>
            {fileList.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Or type a filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            style={{ ...styles.textInput, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          />
          <button onClick={() => fetchReport(filename)} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
            Get Report
          </button>
        </div>

        {loading && <p style={{ ...styles.mutedText, color: colors.muted }}>Running analysis...</p>}
        {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

        {report && (
          <div style={{ marginTop: "24px" }}>
            <div style={styles.titleRow}>
              <h2 style={{ ...styles.resultHeading, color: colors.text }}>
                Results for: <span style={{ color: colors.teal }}>{report.filename}</span>
              </h2>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href={`http://127.0.0.1:5000/export/${report.filename}/pdf`} target="_blank" rel="noreferrer" style={{ ...styles.exportBtn, border: `1px solid ${colors.border}`, color: colors.muted, background: colors.surface }}>PDF</a>
                <a href={`http://127.0.0.1:5000/export/${report.filename}/markdown`} target="_blank" rel="noreferrer" style={{ ...styles.exportBtn, border: `1px solid ${colors.border}`, color: colors.muted, background: colors.surface }}>Markdown</a>
                <a href={`http://127.0.0.1:5000/export/${report.filename}/html`} target="_blank" rel="noreferrer" style={{ ...styles.exportBtn, border: `1px solid ${colors.border}`, color: colors.muted, background: colors.surface }}>HTML</a>
              </div>
            </div>

            {/* Summary strip */}
            <div style={styles.summaryGrid}>
              <StatCard
                label={report.language === "javascript" ? "ESLint Score" : report.language === "python" ? "Pylint Score" : "Static Analysis"}
                value={pylintScore !== null && pylintScore !== undefined ? `${pylintScore}/100` : "N/A"}
                color={scoreColor(pylintScore, colors)}
              />
              <StatCard label="Security Issues" value={banditCount} color={banditCount > 0 ? colors.red : colors.green} />
              <StatCard label="Maintainability" value={maintainability ? `${maintainability.rank} (${maintainability.mi.toFixed(0)})` : "N/A"} color={colors.purple} />
              <StatCard label="AI Quality Score" value={`${aiScore}/100`} color={scoreColor(aiScore, colors)} />
            </div>

            {/* Tabs */}
            <div style={{ ...styles.tabBar, borderBottom: `1px solid ${colors.border}` }}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    ...styles.tabBtn,
                    color: activeTab === tab.key ? colors.teal : colors.muted,
                    borderBottom: activeTab === tab.key ? `2px solid ${colors.teal}` : "2px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ ...styles.tabContent, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              {activeTab === "overview" && <OverviewTab report={report} />}
              {activeTab === "pylint" && <PylintTab report={report} />}
              {activeTab === "security" && <SecurityTab report={report} />}
              {activeTab === "complexity" && <ComplexityTab report={report} />}
              {activeTab === "ai" && <AiTab report={report} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const { colors } = useTheme();
  return (
    <div style={{ ...styles.statCard, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
      <p style={{ ...styles.statLabel, color: colors.muted }}>{label}</p>
      <p style={{ ...styles.statValue, color }}>{value}</p>
    </div>
  );
}

function OverviewTab({ report }) {
  const { colors } = useTheme();
  return (
    <div>
      <p style={{ ...styles.mutedText, color: colors.muted }}>
        <strong style={{ color: colors.text }}>AI Summary:</strong> {report.ai_review?.summary || "No summary available."}
      </p>

      <div style={styles.overviewGrid}>
        <MiniStat label="Classes" value={report.metrics?.num_classes ?? "-"} />
        <MiniStat label="Functions" value={report.metrics?.num_functions ?? "-"} />
        <MiniStat label="Total Lines" value={report.metrics?.total_lines ?? "-"} />
        <MiniStat label="Avg Function Length" value={report.metrics?.avg_function_length ?? "-"} />
      </div>

      <p style={{ ...styles.mutedText, color: colors.muted, marginTop: "16px" }}>
        Use the tabs above to dig into Code Quality, Security, Complexity, or the full AI Review.
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  const { colors } = useTheme();
  return (
    <div style={{ ...styles.miniStat, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
      <p style={{ ...styles.statValue, fontSize: "20px", color: colors.text }}>{value}</p>
      <p style={{ ...styles.statLabel, color: colors.muted }}>{label}</p>
    </div>
  );
}

function PylintTab({ report }) {
  const { colors } = useTheme();
  const issues = report.pylint?.issues || [];
  const toolName = report.language === "javascript" ? "ESLint" : report.language === "python" ? "Pylint" : "Static Analysis";

  if (report.pylint?.note) {
    return <p style={{ ...styles.mutedText, color: colors.muted }}>{report.pylint.note}</p>;
  }

  return (
    <div>
      <p style={{ ...styles.scoreLine, color: colors.text }}>
        <strong>{toolName} Score:</strong> {report.pylint?.score ?? "N/A"} / 100
      </p>
      {issues.length > 0 ? (
        <ul style={styles.list}>
          {issues.map((issue, i) => (
            <li key={i} style={{ ...styles.listItem, color: colors.text }}>
              Line {issue.line}: {issue.message}
              {issue["message-id"] && ` (${issue["message-id"]})`}
              {issue.rule && ` (${issue.rule})`}
            </li>
          ))}
        </ul>
      ) : <p style={{ ...styles.mutedText, color: colors.muted }}>No issues found.</p>}
    </div>
  );
}

function SecurityTab({ report }) {
  const { colors } = useTheme();
  const issues = report.bandit?.issues || [];

  if (report.bandit?.note && issues.length === 0) {
    return <p style={{ color: colors.muted, fontSize: "13px" }}>{report.bandit.note}</p>;
  }
  return (
    <div>
      {issues.length > 0 ? (
        <ul style={styles.list}>
          {issues.map((issue, i) => (
            <li key={i} style={{ ...styles.listItem, color: severityColor(issue.issue_severity, colors) }}>
              <strong>{issue.issue_severity}</strong> (Line {issue.line_number}): {issue.issue_text}
            </li>
          ))}
        </ul>
      ) : <p style={{ ...styles.mutedText, color: colors.muted }}>No security issues found.</p>}

      {report.ai_review?.security_issues?.length > 0 && (
        <>
          <h4 style={{ margin: "16px 0 6px 0", fontSize: "14px", color: colors.text }}>AI-flagged Security Issues</h4>
          <ul style={styles.list}>
            {report.ai_review.security_issues.map((item, i) => (
              <li key={i} style={{ ...styles.listItem, color: colors.red }}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ComplexityTab({ report }) {
  const { colors } = useTheme();
  const complexity = report.radon?.complexity || {};
  const maintainability = report.radon?.maintainability || {};

  if (report.radon?.note) {
    return (
      <div>
        <p style={{ color: colors.muted, fontSize: "13px", marginBottom: "16px" }}>{report.radon.note}</p>
        <div style={styles.overviewGrid}>
          <MiniStat label="Classes" value={report.metrics?.num_classes ?? "-"} />
          <MiniStat label="Functions" value={report.metrics?.num_functions ?? "-"} />
          <MiniStat label="Total Lines" value={report.metrics?.total_lines ?? "-"} />
          <MiniStat label="Avg Function Length" value={report.metrics?.avg_function_length ?? "-"} />
        </div>
      </div>
    );
  }


  return (
    <div>
      {Object.keys(complexity).length > 0 ? (
        Object.entries(complexity).map(([file, functions]) => (
          <div key={file}>
            {functions.map((fn, i) => (
              <p key={i} style={{ ...styles.mutedText, color: colors.muted }}>
                Function <strong style={{ color: colors.text }}>{fn.name}</strong>: complexity {fn.complexity} (rank {fn.rank})
              </p>
            ))}
          </div>
        ))
      ) : <p style={{ ...styles.mutedText, color: colors.muted }}>No complexity data.</p>}

      {Object.entries(maintainability).map(([file, data]) => (
        <p key={file} style={{ ...styles.mutedText, color: colors.muted }}>Maintainability Index: {data.mi?.toFixed(1)} (rank {data.rank})</p>
      ))}

      <div style={{ ...styles.overviewGrid, marginTop: "16px" }}>
        <MiniStat label="Classes" value={report.metrics?.num_classes ?? "-"} />
        <MiniStat label="Functions" value={report.metrics?.num_functions ?? "-"} />
        <MiniStat label="Total Lines" value={report.metrics?.total_lines ?? "-"} />
        <MiniStat label="Avg Function Length" value={report.metrics?.avg_function_length ?? "-"} />
      </div>
    </div>
  );
}

function AiTab({ report }) {
  const { colors } = useTheme();
  const ai = report.ai_review;
  if (!ai || ai.error) {
    return <p style={{ ...styles.errorText, color: colors.red }}>AI review failed: {ai?.error || "Unknown error"}</p>;
  }

  return (
    <div>
      <p style={{ fontSize: "18px", margin: "0 0 10px 0", color: colors.text }}>
        <strong>Quality Score:</strong>{" "}
        <span style={{ color: scoreColor(ai.quality_score, colors) }}>{ai.quality_score} / 100</span>
      </p>
      <p style={{ ...styles.mutedText, color: colors.muted }}>
        <strong style={{ color: colors.text }}>Summary:</strong> {ai.summary}
      </p>

      <ReviewList title="🐞 Bugs" items={ai.bugs} color={colors.red} />
      <ReviewList title="🔒 Security Issues" items={ai.security_issues} color={colors.red} />
      <ReviewList title="👃 Code Smells" items={ai.code_smells} color={colors.amber} />
      <ReviewList title="⚡ Performance" items={ai.performance_improvements} color={colors.blue} />
      <ReviewList title="✅ Best Practices" items={ai.best_practices} color={colors.green} />
      <ReviewList title="🔧 Refactoring" items={ai.refactoring_suggestions} color={colors.blue} />
      <NamingSuggestions data={ai.naming_suggestions} />
    </div>
  );
}

function ReviewList({ title, items, color }) {
  const { colors } = useTheme();
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginTop: "14px" }}>
      <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: colors.text }}>{title}</h4>
      <ul style={styles.list}>
        {items.map((item, i) => (
          <li key={i} style={{ ...styles.listItem, color }}>{typeof item === "string" ? item : JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function NamingSuggestions({ data }) {
  const { colors } = useTheme();
  if (!data || (Object.keys(data.functions || {}).length === 0 && Object.keys(data.variables || {}).length === 0)) {
    return null;
  }
  return (
    <div style={{ marginTop: "14px" }}>
      <h4 style={{ margin: "0 0 6px 0", fontSize: "14px", color: colors.text }}>🏷️ Naming Suggestions</h4>
      {data.functions && Object.keys(data.functions).length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <p style={{ fontSize: "12px", color: colors.muted, margin: "0 0 4px 0" }}>Functions</p>
          <ul style={styles.list}>
            {Object.entries(data.functions).map(([oldName, suggestion], i) => (
              <li key={i} style={{ ...styles.listItem, color: colors.indigo }}>
                <code style={{ color: colors.text }}>{oldName}</code> → {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
      {data.variables && Object.keys(data.variables).length > 0 && (
        <div>
          <p style={{ fontSize: "12px", color: colors.muted, margin: "0 0 4px 0" }}>Variables</p>
          <ul style={styles.list}>
            {Object.entries(data.variables).map(([oldName, suggestion], i) => (
              <li key={i} style={{ ...styles.listItem, color: colors.indigo }}>
                <code style={{ color: colors.text }}>{oldName}</code> → {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function severityColor(severity, colors) {
  if (severity === "HIGH") return colors.red;
  if (severity === "MEDIUM") return colors.amber;
  return colors.muted;
}

function scoreColor(score, colors) {
  if (score === "N/A" || score === undefined) return colors.muted;
  if (score >= 80) return colors.green;
  if (score >= 50) return colors.amber;
  return colors.red;
}

const styles = {
  content: { maxWidth: "800px", margin: "0 auto", padding: "50px 24px" },
  searchRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  textInput: {
    padding: "10px", flex: 1, minWidth: "220px", borderRadius: "6px", fontFamily: fonts.mono, fontSize: "13px",
  },
  primaryBtn: {
    fontFamily: fonts.mono, padding: "10px 20px", color: "#0D1117",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  },
  exportBtn: {
    fontFamily: fonts.mono, fontSize: "12px", padding: "6px 12px", borderRadius: "6px", textDecoration: "none",
  },
  errorText: { marginTop: "14px", fontSize: "14px" },
  mutedText: { fontSize: "13px", margin: "4px 0" },
  titleRow: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "18px" },
  resultHeading: { fontSize: "18px", fontWeight: 600, margin: 0 },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  statCard: {
    borderRadius: "8px",
    padding: "14px",
    textAlign: "center",
  },
  statLabel: { fontSize: "11px", margin: "0 0 6px 0", fontFamily: fonts.mono, textTransform: "uppercase", letterSpacing: "0.5px" },
  statValue: { fontSize: "22px", fontWeight: 700, margin: 0 },

  tabBar: {
    display: "flex",
    gap: "4px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  tabBtn: {
    fontFamily: fonts.mono,
    fontSize: "13px",
    padding: "10px 14px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  tabContent: {
    borderRadius: "8px",
    padding: "20px",
    minHeight: "200px",
  },

  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: "10px",
    marginTop: "16px",
  },
  miniStat: {
    borderRadius: "6px",
    padding: "12px",
    textAlign: "center",
  },

  scoreLine: { fontSize: "13px", margin: "4px 0" },
  list: { margin: "6px 0 0 0", paddingLeft: "20px" },
  listItem: { fontSize: "13px", marginBottom: "6px" },
};

export default ReportPage;