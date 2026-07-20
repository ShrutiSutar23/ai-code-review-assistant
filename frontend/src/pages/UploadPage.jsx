import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../apiConfig";
import PageHeader from "../components/PageHeader";

function UploadPage() {
  const { colors } = useTheme();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploadedFilename, setUploadedFilename] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setUploadedFilename("");
  };

  const handleUpload = async () => {
    setError("");
    if (!file) {
      setError("Please choose a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData);
      setMessage(response.data.message);
      setUploadedFilename(response.data.filename);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/upload" title="Upload Code" subtitle="Choose a source file from your machine to analyze." />

        <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <input type="file" onChange={handleFileChange} style={{ ...styles.fileInput, color: colors.text }} />
          <button
            onClick={handleUpload}
            style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}
          >
            Upload
          </button>

          {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

          {uploadedFilename && (
            <div style={{ ...styles.successBox, borderTop: `1px solid ${colors.border}` }}>
              <p style={{ ...styles.successText, color: colors.green }}>✓ {message}</p>
              <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                <Link
                  to={`/report?file=${encodeURIComponent(uploadedFilename)}`}
                  style={{ ...styles.actionBtn, borderColor: colors.amber, color: colors.amber }}
                >
                  View Report →
                </Link>
                <Link
                  to={`/documentation?file=${encodeURIComponent(uploadedFilename)}`}
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
  fileInput: { marginBottom: "16px", display: "block", fontFamily: fonts.sans, fontSize: "14px" },
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

export default UploadPage;