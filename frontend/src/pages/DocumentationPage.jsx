import { useState } from "react";
import axios from "axios";

function DocumentationPage() {
  const [filename, setFilename] = useState("");
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocumentation = async () => {
    setError("");
    setDoc(null);

    if (!filename) {
      setError("Please enter a filename (e.g., test.py)");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://127.0.0.1:5000/documentation/${filename}`);
      setDoc(response.data.documentation);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Documentation Generator</h1>

      <input
        type="text"
        placeholder="Enter filename (e.g. test.py)"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        style={{ padding: "8px", width: "300px", marginRight: "10px" }}
      />
      <button onClick={fetchDocumentation} style={{ padding: "8px 16px" }}>
        Generate Documentation
      </button>

      {loading && <p>Generating documentation, please wait...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {doc && !doc.error && (
        <div style={{ marginTop: "30px" }}>
          <div style={cardStyle}>
            <h3>Module Summary</h3>
            <p>{doc.module_summary}</p>
          </div>

          {doc.functions && doc.functions.length > 0 && (
            <div style={cardStyle}>
              <h3>Functions</h3>
              {doc.functions.map((fn, i) => (
                <div key={i} style={{ marginBottom: "16px" }}>
                  <h4>{fn.name}()</h4>
                  <p>{fn.description}</p>
                  {fn.parameters && fn.parameters.length > 0 && (
                    <p><strong>Parameters:</strong> {fn.parameters.join(", ")}</p>
                  )}
                  {fn.returns && <p><strong>Returns:</strong> {fn.returns}</p>}
                </div>
              ))}
            </div>
          )}

          {doc.classes && doc.classes.length > 0 && (
            <div style={cardStyle}>
              <h3>Classes</h3>
              {doc.classes.map((cls, i) => (
                <div key={i} style={{ marginBottom: "16px" }}>
                  <h4>{cls.name}</h4>
                  <p>{cls.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {doc && doc.error && (
        <p style={{ color: "red" }}>Documentation generation failed: {doc.error}</p>
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

export default DocumentationPage;