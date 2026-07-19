import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

function GithubUploadPage() {
  const { colors } = useTheme();
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSaved("");
    if (!url.trim()) {
      setError("Please paste a GitHub file URL.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload/github", { url });
      setMessage(response.data.message);
      setSaved(response.data.filename);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch file.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/import" title="GitHub Import" subtitle="Paste a link to a single file on GitHub." />

        <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <input
            type="text"
            placeholder="https://github.com/user/repo/blob/main/file.py"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              ...styles.textInput,
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          <button onClick={handleSubmit} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
            Fetch File
          </button>

          {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

          {saved && (
            <div style={{ ...styles.successBox, borderTop: `1px solid ${colors.border}` }}>
              <p style={{ ...styles.successText, color: colors.green }}>✓ {message} ({saved})</p>
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
  content: { maxWidth: "640px", margin: "0 auto", padding: "50px 24px" },
  card: { borderRadius: "10px", padding: "24px" },
  textInput: {
    padding: "10px", width: "100%", marginBottom: "14px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px", boxSizing: "border-box",
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

export default GithubUploadPage;