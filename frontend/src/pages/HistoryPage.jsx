import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

function HistoryPage() {
  const { colors } = useTheme();
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");

  const fetchHistory = () => {
    const params = {};
    if (search) params.search = search;
    if (minScore) params.min_score = minScore;
    if (maxScore) params.max_score = maxScore;

    axios.get("http://127.0.0.1:5000/history", { params })
      .then((res) => setHistory(res.data.history))
      .catch(() => setError("Could not load history."));
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/history/${reviewId}`);
      setHistory((prev) => prev.filter((item) => item.review_id !== reviewId));
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  const scoreColor = (score) => {
    if (score >= 80) return colors.green;
    if (score >= 50) return colors.amber;
    return colors.red;
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/history" title="Review History" subtitle="Search, filter, and revisit past reviews." />

        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search project name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...styles.textInput, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          />
          <input
            type="number"
            placeholder="Min score"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            style={{ ...styles.textInput, maxWidth: "110px", backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          />
          <input
            type="number"
            placeholder="Max score"
            value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)}
            style={{ ...styles.textInput, maxWidth: "110px", backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          />
          <button onClick={fetchHistory} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>Filter</button>
        </div>

        {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}
        {history.length === 0 && !error && <p style={{ ...styles.mutedText, color: colors.muted }}>No reviews found.</p>}

        {history.map((item) => (
          <div key={item.review_id} style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 style={{ ...styles.projectName, color: colors.text }}>{item.project_name}</h3>
              <span style={{ ...styles.scoreBadge, color: scoreColor(item.review_score) }}>{item.review_score}/100</span>
            </div>
            <p style={{ ...styles.mutedText, color: colors.muted }}>{item.summary}</p>
            <p style={{ ...styles.timestamp, color: colors.muted }}>{new Date(item.created_at).toLocaleString()}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <Link
                to={`/report?file=${encodeURIComponent(item.project_name)}`}
                style={{ ...styles.viewBtn, borderColor: colors.amber, color: colors.amber }}
              >
                View Report →
              </Link>
              <button
                onClick={() => handleDelete(item.review_id)}
                style={{ ...styles.deleteBtn, color: colors.red, borderColor: colors.red }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  content: { maxWidth: "720px", margin: "0 auto", padding: "50px 24px" },
  filterRow: { display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" },
  textInput: {
    padding: "10px", flex: 1, minWidth: "140px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px",
  },
  primaryBtn: {
    fontFamily: fonts.mono, padding: "10px 16px", color: "#0D1117",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  },
  errorText: { fontSize: "14px" },
  mutedText: { fontSize: "13px", margin: "6px 0" },
  card: { borderRadius: "8px", padding: "18px", marginBottom: "14px" },
  projectName: { margin: 0, fontSize: "15px", fontFamily: fonts.mono },
  scoreBadge: { fontFamily: fonts.mono, fontSize: "13px", fontWeight: 600 },
  timestamp: { fontSize: "11px", margin: "6px 0 0 0" },
  viewBtn: {
    fontFamily: fonts.mono, fontSize: "12px", padding: "6px 12px", border: "1px solid",
    borderRadius: "6px", textDecoration: "none",
  },
  deleteBtn: {
    fontFamily: fonts.mono, fontSize: "12px", padding: "6px 12px", backgroundColor: "transparent",
    border: "1px solid", borderRadius: "6px", cursor: "pointer",
  },
};

export default HistoryPage;