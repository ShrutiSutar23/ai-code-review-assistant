import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../apiConfig";
import PageHeader from "../components/PageHeader";

function PasteCodePage() {
  const { colors, mode } = useTheme();
  const [code, setCode] = useState("# Write or paste your Python code here\n");
  const [filename, setFilename] = useState("snippet.py");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSaved("");
    if (!code.trim()) {
      setError("Please write some code first.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/upload/snippet`, { code, filename });
      setMessage(response.data.message);
      setSaved(response.data.filename);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save snippet.");
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
        <PageHeader eyebrow="~/paste" title="Paste Snippet" subtitle="Write or paste code directly into the editor below." />

        <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <input
            type="text"
            placeholder="Filename (e.g. my_code.py)"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            style={{
              ...styles.textInput,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />

          <div style={{ ...styles.editorWrapper, border: `1px solid ${colors.border}` }}>
            <Editor
              height="420px"
              language={language}
              theme={mode === "dark" ? "vs-dark" : "light"}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 13,
                fontFamily: fonts.mono,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>

          <button onClick={handleSubmit} style={{ ...styles.primaryBtn, backgroundColor: colors.teal, marginTop: "14px" }}>
            Save Snippet
          </button>

          {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

          {saved && (
            <div style={{ ...styles.successBox, borderTop: `1px solid ${colors.border}` }}>
              <p style={{ ...styles.successText, color: colors.green }}>✓ {message}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                <Link
                  to={`/report?file=${encodeURIComponent(saved)}`}
                  style={{ ...styles.actionBtn, borderColor: colors.amber, color: colors.amber }}
                >
                  View Report →
                </Link>
                <Link
                  to={`/documentation?file=${encodeURIComponent(saved)}`}
                  style={{ ...styles.actionBtn, borderColor: colors.green, color: colors.green }}
                >
                  Generate Documentation →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  content: { maxWidth: "820px", margin: "0 auto", padding: "50px 24px" },
  card: { borderRadius: "10px", padding: "24px" },
  textInput: {
    padding: "10px", width: "100%", marginBottom: "14px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px", boxSizing: "border-box",
  },
  editorWrapper: {
    borderRadius: "6px",
    overflow: "hidden",
  },
  primaryBtn: {
    fontFamily: fonts.mono, padding: "10px 20px", color: "#0D1117",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  },
  errorText: { marginTop: "14px", fontSize: "14px" },
  successBox: { marginTop: "18px", paddingTop: "18px" },
  successText: { fontSize: "14px", margin: 0 },
  actionBtn: {
    fontFamily: fonts.mono, fontSize: "13px", padding: "8px 14px", border: "1px solid",
    borderRadius: "6px", textDecoration: "none", background: "transparent",
  },
};

export default PasteCodePage;