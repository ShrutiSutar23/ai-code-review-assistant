import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

function DocumentationPage() {
  const { colors } = useTheme();
  const [searchParams] = useSearchParams();
  const [filename, setFilename] = useState(searchParams.get("file") || "");
  const [doc, setDoc] = useState(null);
  const [readme, setReadme] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocumentation = useCallback(async (fname) => {
    setError("");
    setDoc(null);
    if (!fname) {
      setError("Please enter a filename (e.g., test.py)");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/documentation/${fname}`);
      setDoc(response.data.documentation);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReadme = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:5000/documentation/${filename}/readme`);
      setReadme(res.data.readme_summary);
    } catch (err) {
      setReadme("Failed to generate README summary.");
    }
  };

  useEffect(() => {
    const fileParam = searchParams.get("file");
    if (fileParam) {
      setFilename(fileParam);
      fetchDocumentation(fileParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/docs" title="Documentation Generator" subtitle="AI-generated docs for functions, classes, and modules." />

        <div style={styles.searchRow}>
          <input
            type="text"
            placeholder="Enter filename (e.g. test.py)"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            style={{
              ...styles.textInput,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          <button onClick={() => fetchDocumentation(filename)} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
            Generate Docs
          </button>
          <button onClick={fetchReadme} style={{ ...styles.secondaryBtn, color: colors.indigo, borderColor: colors.indigo }}>
            README Summary
          </button>
        </div>

        {loading && <p style={{ ...styles.mutedText, color: colors.muted }}>Generating documentation...</p>}
        {error && <p style={{ ...styles.errorText, color: colors.red }}>{error}</p>}

        {readme && (
          <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.indigo}`, marginTop: "20px" }}>
            <h3 style={{ ...styles.cardTitle, color: colors.text }}>README Summary</h3>
            <pre style={{ ...styles.pre, color: colors.muted }}>{readme}</pre>
          </div>
        )}

        {doc && !doc.error && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.teal}` }}>
              <h3 style={{ ...styles.cardTitle, color: colors.text }}>Module Summary</h3>
              <p style={{ ...styles.mutedText, color: colors.muted }}>{doc.module_summary}</p>
            </div>

            {doc.functions?.length > 0 && (
              <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.blue}` }}>
                <h3 style={{ ...styles.cardTitle, color: colors.text }}>Functions</h3>
                {doc.functions.map((fn, i) => (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <p style={{ ...styles.fnName, color: colors.text }}>{fn.name}()</p>
                    <p style={{ ...styles.mutedText, color: colors.muted }}>{fn.description}</p>
                    {fn.parameters?.length > 0 && (
                      <p style={{ ...styles.mutedText, color: colors.muted }}>
                        <strong style={{ color: colors.text }}>Parameters:</strong> {fn.parameters.join(", ")}
                      </p>
                    )}
                    {fn.returns && (
                      <p style={{ ...styles.mutedText, color: colors.muted }}>
                        <strong style={{ color: colors.text }}>Returns:</strong> {fn.returns}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {doc.classes?.length > 0 && (
              <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderLeft: `3px solid ${colors.purple}` }}>
                <h3 style={{ ...styles.cardTitle, color: colors.text }}>Classes</h3>
                {doc.classes.map((cls, i) => (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <p style={{ ...styles.fnName, color: colors.text }}>{cls.name}</p>
                    <p style={{ ...styles.mutedText, color: colors.muted }}>{cls.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {doc?.error && <p style={{ ...styles.errorText, color: colors.red }}>Documentation generation failed: {doc.error}</p>}
      </div>
    </div>
  );
}

const styles = {
  content: { maxWidth: "760px", margin: "0 auto", padding: "50px 24px" },
  searchRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  textInput: {
    padding: "10px", flex: 1, minWidth: "200px", borderRadius: "6px",
    fontFamily: fonts.mono, fontSize: "13px",
  },
  primaryBtn: {
    fontFamily: fonts.mono, padding: "10px 16px", color: "#0D1117",
    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600,
  },
  secondaryBtn: {
    fontFamily: fonts.mono, padding: "10px 16px", backgroundColor: "transparent",
    border: "1px solid", borderRadius: "6px", cursor: "pointer", fontSize: "13px",
  },
  errorText: { marginTop: "14px", fontSize: "14px" },
  mutedText: { fontSize: "13px", margin: "4px 0" },
  card: { borderRadius: "8px", padding: "18px", marginBottom: "14px" },
  cardTitle: { margin: "0 0 10px 0", fontSize: "15px" },
  fnName: { fontFamily: fonts.mono, fontSize: "14px", margin: "0 0 4px 0" },
  pre: { whiteSpace: "pre-wrap", fontFamily: fonts.sans, fontSize: "13px", margin: 0 },
};

export default DocumentationPage;