import { useState } from "react";
import axios from "axios";

function PasteCodePage() {
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("snippet.py");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!code.trim()) {
      setMessage("Please paste some code first.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload/snippet", {
        code,
        filename
      });
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to save snippet.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Paste Your Code</h1>

      <input
        type="text"
        placeholder="Filename (e.g. my_code.py)"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
        style={{ padding: "8px", width: "300px", marginBottom: "10px" }}
      />

      <textarea
        placeholder="Paste your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={20}
        style={{ width: "100%", fontFamily: "monospace", padding: "10px" }}
      />

      <br /><br />
      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>
        Save Snippet
      </button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default PasteCodePage;