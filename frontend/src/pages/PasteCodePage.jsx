import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

function PasteCodePage() {
  const { colors } = useTheme();
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("snippet.py");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSaved("");
    if (!code.trim()) {
      setError("Please paste some code first.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload/snippet", { code, filename });
      setMessage(response.data.message);
      setSaved(response.data.filename);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save snippet.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/paste" title="Paste Snippet" subtitle="Drop code directly into the editor below." />

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
          <textarea
            placeholder="Paste your code here..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={16}
            style={{
              ...styles.textarea,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          <button onClick={handleSubmit} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
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
  content: { maxWidth: "720px", margin: "0 auto", padding: "50px 24px" },
  card: { borderRadius: "10px", padding: "24px" },
  textInput: {
    padding: "10px", width: "100%", marginBottom: "14px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", fontFamily: fonts.mono, padding: "14px", borderRadius: "6px",
    fontSize: "13px", marginBottom: "14px", boxSizing: "border-box", resize: "vertical",
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