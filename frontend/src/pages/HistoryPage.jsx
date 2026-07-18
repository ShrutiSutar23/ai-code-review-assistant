import { useEffect, useState } from "react";
import axios from "axios";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/history")
      .then((res) => setHistory(res.data.history))
      .catch((err) => setError("Could not load history."));
  }, []);

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Review History</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {history.length === 0 && !error && <p>No reviews yet.</p>}

      {history.map((item) => (
        <div key={item.review_id} style={cardStyle}>
          <h3>{item.project_name}</h3>
          <p><strong>Score:</strong> {item.review_score} / 100</p>
          <p>{item.summary}</p>
          <p style={{ fontSize: "12px", color: "#888" }}>{new Date(item.created_at).toLocaleString()}</p>
        </div>
      ))}
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

export default HistoryPage;