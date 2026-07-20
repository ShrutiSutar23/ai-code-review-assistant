import { useState, useEffect } from "react";
import axios from "axios";
import { DiffEditor } from "@monaco-editor/react";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../apiConfig";
import PageHeader from "../components/PageHeader";

function ComparePage() {
  const { colors, mode } = useTheme();
  const [fileList, setFileList] = useState([]);
  const [fileA, setFileA] = useState("");
  const [fileB, setFileB] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/files`)
      .then((res) => setFileList(res.data.files || []))
      .catch(() => {});
  }, []);

  const handleCompare = async () => {
    setError("");
    setResult(null);
    if (!fileA || !fileB) {
      setError("Please choose two files to compare.");
      return;
    }
    if (fileA === fileB) {
      setError("Please choose two different files.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/compare/${fileA}/${fileB}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const language = (fname) => {
    if (fname?.endsWith(".js")) return "javascript";
    if (fname?.endsWith(".java")) return "java";
    if (fname?.endsWith(".cpp") || fname?.endsWith(".c")) return "cpp";
    if (fname?.endsWith(".ts")) return "typescript";
    return "python";
  };

  const winnerLabel = (winner) => {
    if (winner === "file1") return result.filename_a;
    if (winner === "file2") return result.filename_b;
    return "Similar quality";
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/compare" title="Repository Comparison" subtitle="Compare two files side-by-side, with an AI-generated verdict." />

        <div style={styles.searchRow}>
          <select
            value={fileA}
            onChange={(e) => setFileA(e.target.value)}
            style={{ ...styles.textInput, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          >
            <option value="">📁 File 1...</option>
            {fileList.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            value={fileB}
            onChange={(e) => setFileB(e.target.value)}
            style={{ ...styles.textInput, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }}
          >
            <option value="">📁 File 2...</option>
            {fileList.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button onClick={handleCompare} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
            Compare with AI
          </button>
        </div>

        {loading && <p style={{ ...styles.mutedText, color: colors.muted }}>Comparing files with AI...</p>}
        {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

        {result && !result.comparison?.error && (
          <div style={{ marginTop: "24px" }}>
            <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <h3 style={{ ...styles.cardTitle, color: colors.text }}>Verdict</h3>
              <p style={{ ...styles.mutedText, color: colors.muted }}>
                <strong style={{ color: colors.teal }}>{winnerLabel(result.comparison.which_is_better)}</strong>
                {result.comparison.which_is_better !== "similar" && " has better code quality"}
              </p>
              <p style={{ ...styles.mutedText, color: colors.muted }}>{result.comparison.reasoning}</p>
            </div>

            <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <h3 style={{ ...styles.cardTitle, color: colors.text }}>Similarity Summary</h3>
              <p style={{ ...styles.mutedText, color: colors.muted }}>{result.comparison.similarity_summary}</p>
            </div>

            {result.comparison.key_differences?.length > 0 && (
              <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 style={{ ...styles.cardTitle, color: colors.text }}>Key Differences</h3>
                <ul style={styles.list}>
                  {result.comparison.key_differences.map((item, i) => (
                    <li key={i} style={{ ...styles.listItem, color: colors.text }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.comparison.shared_patterns?.length > 0 && (
              <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 style={{ ...styles.cardTitle, color: colors.text }}>Shared Patterns</h3>
                <ul style={styles.list}>
                  {result.comparison.shared_patterns.map((item, i) => (
                    <li key={i} style={{ ...styles.listItem, color: colors.text }}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={styles.legendRow}>
              <span style={{ color: colors.red }}>■ {result.filename_a}</span>
              <span style={{ color: colors.green }}>■ {result.filename_b}</span>
            </div>
            <div style={{ ...styles.diffWrapper, border: `1px solid ${colors.border}` }}>
              <DiffEditor
                height="480px"
                language={language(result.filename_a)}
                theme={mode === "dark" ? "vs-dark" : "light"}
                original={result.code_a}
                modified={result.code_b}
                options={{
                  fontSize: 13,
                  fontFamily: fonts.mono,
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  renderSideBySide: true,
                }}
              />
            </div>
          </div>
        )}

        {result?.comparison?.error && (
          <p style={{ ...styles.errorText, color: colors.red }}>Comparison failed: {result.comparison.error}</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  content: { maxWidth: "1000px", margin: "0 auto", padding: "50px 24px" },
  searchRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  textInput: {
    padding: "10px", flex: 1, minWidth: "180px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px",
  },
  primaryBtn: {
    fontFamily: fonts.mono, padding: "10px 20px", color: "#0D1117",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  },
  errorText: { marginTop: "14px", fontSize: "14px" },
  mutedText: { fontSize: "13px", margin: "4px 0" },
  card: { borderRadius: "8px", padding: "18px", marginBottom: "14px" },
  cardTitle: { margin: "0 0 10px 0", fontSize: "15px" },
  list: { margin: "6px 0 0 0", paddingLeft: "20px" },
  listItem: { fontSize: "13px", marginBottom: "6px" },
  legendRow: { display: "flex", gap: "20px", fontSize: "13px", fontFamily: fonts.mono, margin: "16px 0 10px 0" },
  diffWrapper: { borderRadius: "6px", overflow: "hidden" },
};

export default ComparePage;