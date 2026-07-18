import { useEffect, useState } from "react";
import axios from "axios";

function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");

  const fetchHistory = () => {
    const params = {};
    if (search) params.search = search;
    if (minScore) params.min_score = minScore;
    if (maxScore) params.max_score = maxScore;

    axios.get("http://127.0.0.1:5000/history", { params })
      .then((res) => setHistory(res.data.history))
      .catch(() => setError("Could not load history."));
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await axios.delete(`http://127.0.0.1:5000/history/${reviewId}`);
      setHistory((prev) => prev.filter((item) => item.review_id !== reviewId));
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Review History</h1>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by project name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "200px" }}
        />
        <input
          type="number"
          placeholder="Min score"
          value={minScore}
          onChange={(e) => setMinScore(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "100px" }}
        />
        <input
          type="number"
          placeholder="Max score"
          value={maxScore}
          onChange={(e) => setMaxScore(e.target.value)}
          style={{ padding: "8px", marginRight: "10px", width: "100px" }}
        />
        <button onClick={fetchHistory} style={{ padding: "8px 16px" }}>
          Filter
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {history.length === 0 && !error && <p>No reviews found.</p>}

      {history.map((item) => (
        <div key={item.review_id} style={cardStyle}>
          <h3>{item.project_name}</h3>
          <p><strong>Score:</strong> {item.review_score} / 100</p>
          <p>{item.summary}</p>
          <p style={{ fontSize: "12px", color: "#888" }}>{new Date(item.created_at).toLocaleString()}</p>
          <button
            onClick={() => handleDelete(item.review_id)}
            style={{ padding: "6px 12px", backgroundColor: "#e63946", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          >
            Delete
          </button>
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