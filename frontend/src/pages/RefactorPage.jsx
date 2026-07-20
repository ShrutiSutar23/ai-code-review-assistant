import { useState, useEffect } from "react";
import axios from "axios";
import { DiffEditor } from "@monaco-editor/react";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

function RefactorPage() {
  const { colors, mode } = useTheme();
  const [filename, setFilename] = useState("");
  const [fileList, setFileList] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/files")
      .then((res) => setFileList(res.data.files || []))
      .catch(() => {});
  }, []);

  const handleRefactor = async (fname) => {
    setError("");
    setResult(null);
    if (!fname) {
      setError("Please choose a file first.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/refactor/${fname}`);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const language = filename.endsWith(".js") ? "javascript"
    : filename.endsWith(".java") ? "java"
    : filename.endsWith(".cpp") || filename.endsWith(".c") ? "cpp"
    : filename.endsWith(".ts") ? "typescript"
    : "python";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/refactor" title="AI Code Refactoring" subtitle="Let AI rewrite your code to fix bugs, security issues, and code smells." />

        <div style={styles.searchRow}>
          <select
            value={filename}
            onChange={(e) => {
              setFilename(e.target.value);
              handleRefactor(e.target.value);
            }}
            style={{
              ...styles.textInput,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          >
            <option value="">📁 Choose a file to refactor...</option>
            {fileList.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <button
            onClick={() => handleRefactor(filename)}
            style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}
          >
            Refactor with AI
          </button>
        </div>

        {loading && <p style={{ ...styles.mutedText, color: colors.muted }}>Asking AI to rewrite your code...</p>}
        {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

        {result && (
          <div style={{ marginTop: "24px" }}>
            <div style={styles.legendRow}>
              <span style={{ color: colors.red }}>■ Original</span>
              <span style={{ color: colors.green }}>■ Refactored</span>
            </div>
            <div style={{ ...styles.diffWrapper, border: `1px solid ${colors.border}` }}>
              <DiffEditor
                height="520px"
                language={language}
                theme={mode === "dark" ? "vs-dark" : "light"}
                original={result.original_code}
                modified={result.refactored_code}
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
      </div>
    </div>
  );
}

const styles = {
  content: { maxWidth: "1000px", margin: "0 auto", padding: "50px 24px" },
  searchRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  textInput: {
    padding: "10px", flex: 1, minWidth: "220px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px",
  },
  primaryBtn: {
    fontFamily: fonts.mono, padding: "10px 20px", color: "#0D1117",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  },
  errorText: { marginTop: "14px", fontSize: "14px" },
  mutedText: { fontSize: "13px", margin: "14px 0" },
  legendRow: { display: "flex", gap: "20px", fontSize: "13px", fontFamily: fonts.mono, marginBottom: "10px" },
  diffWrapper: { borderRadius: "6px", overflow: "hidden" },
};

export default RefactorPage;