import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

function ProfilePage() {
  const { colors } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setEmail(res.data.email);
        setName(res.data.name || "");
      })
      .catch(() => setMessage("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [token]);

  const handleUpdate = async () => {
    setMessage("");
    try {
      const response = await axios.put(
        "http://127.0.0.1:5000/auth/profile",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: colors.muted }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <Link to="/" style={{ ...styles.backLink, color: colors.muted }}>← dashboard</Link>
        <p style={{ ...styles.eyebrow, color: colors.teal }}>~/profile</p>
        <h1 style={{ ...styles.h1, color: colors.text }}>My Profile</h1>

        <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
          <label style={{ ...styles.label, color: colors.text }}>Name</label>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...styles.input, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
          />

          <label style={{ ...styles.label, color: colors.text }}>Email</label>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...styles.input, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
          />

          <button onClick={handleUpdate} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
            Save Changes
          </button>

          {message && (
            <p style={{ marginTop: "10px", color: message.toLowerCase().includes("success") ? colors.green : colors.red, fontSize: "13px" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  content: { maxWidth: "420px", margin: "0 auto", padding: "50px 24px" },
  backLink: {
    fontFamily: fonts.mono,
    fontSize: "12px",
    textDecoration: "none",
    display: "inline-block",
    marginBottom: "16px",
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: "13px",
    margin: "0 0 8px 0",
  },
  h1: {
    fontSize: "26px",
    margin: "0 0 20px 0",
    fontWeight: 600,
  },
  card: {
    borderRadius: "10px",
    padding: "24px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    fontSize: "13px",
  },
  input: {
    padding: "10px",
    width: "100%",
    marginBottom: "16px",
    borderRadius: "6px",
    fontFamily: fonts.sans,
    fontSize: "14px",
    boxSizing: "border-box",
  },
  primaryBtn: {
    fontFamily: fonts.mono,
    padding: "10px 20px",
    width: "100%",
    color: "#0D1117",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
};

export default ProfilePage;