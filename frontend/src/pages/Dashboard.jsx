import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

function Dashboard() {
  const navigate = useNavigate();
  const { mode, toggleTheme, colors } = useTheme();
  const [userName, setUserName] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    axios.get("http://127.0.0.1:5000/auth/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        setUserName(res.data.name || "");
      })
      .catch(() => {});

    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth");
  };

  const cards = [
    { cmd: "upload", title: "Upload Code", desc: "Analyze a source file from your machine", to: "/upload", accent: colors.teal },
    { cmd: "paste", title: "Paste Snippet", desc: "Drop code straight into the editor", to: "/paste", accent: colors.blue },
    { cmd: "import --github", title: "GitHub Import", desc: "Pull a file straight from a repo URL", to: "/github", accent: colors.purple },
    { cmd: "review", title: "View Report", desc: "Pylint · Bandit · Radon · AI review", to: "/report", accent: colors.amber },
    { cmd: "docs --gen", title: "Documentation", desc: "Auto-generate docs for functions & classes", to: "/documentation", accent: colors.green },
    { cmd: "log --history", title: "History", desc: "Search, filter, and revisit past reviews", to: "/history", accent: colors.red },
  ];

  const greeting = userName ? userName : "there";
  const initial = userName ? userName.charAt(0).toUpperCase() : "?";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <style>{`
        @keyframes blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .dash-card {
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .dash-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
        }
        .dash-card:focus-visible {
          outline: 2px solid ${colors.teal};
          outline-offset: 2px;
        }
        .avatar-link:hover .avatar-circle {
          border-color: ${colors.teal};
        }
      `}</style>

      {/* Title bar */}
      <div style={{ ...styles.titleBar, backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <span style={{ ...styles.dot, background: colors.red }} />
          <span style={{ ...styles.dot, background: colors.amber }} />
          <span style={{ ...styles.dot, background: colors.green }} />
        </div>
        <span style={{ ...styles.titleBarText, color: colors.muted }}>ai-code-review-assistant — dashboard</span>
        <span style={{ ...styles.clock, color: colors.muted }}>{time.toLocaleTimeString()}</span>

        {/* Profile + Theme + Logout, top-right corner */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginLeft: "16px" }}>
          <Link to="/profile" className="avatar-link" style={styles.avatarLink} title="My Profile">
            <span
              className="avatar-circle"
              style={{ ...styles.avatarCircle, backgroundColor: colors.surfaceHover, border: `1px solid ${colors.border}`, color: colors.text }}
            >
              {initial}
            </span>
          </Link>
          <button onClick={toggleTheme} style={{ ...styles.themeToggle, borderColor: colors.border, color: colors.text }}>
            {mode === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button onClick={handleLogout} style={{ ...styles.logoutBtn, color: colors.red, borderColor: colors.red }}>
            logout
          </button>
        </div>
      </div>

      <div style={styles.content}>
        <div style={styles.headerRow}>
          <div>
            <p style={{ ...styles.eyebrow, color: colors.teal }}>~/dashboard</p>
            <h1 style={styles.h1}>
              Hey, {greeting}
              <span style={{ animation: "blink 1s step-start infinite", color: colors.teal }}>_</span>
            </h1>
            <p style={{ ...styles.subtitle, color: colors.muted }}>
              {userName ? "Pick a tool below to get started." : (
                <>No username set yet — <Link to="/profile" style={{ color: colors.teal }}>add one in your profile</Link>.</>
              )}
            </p>
          </div>
        </div>

        <div style={styles.grid}>
          {cards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="dash-card"
              style={{
                ...styles.card,
                backgroundColor: colors.surface,
                border: `1px solid ${colors.border}`,
                borderLeft: `3px solid ${card.accent}`,
              }}
            >
              <p style={{ ...styles.cmdLabel, color: card.accent }}>$ {card.cmd}</p>
              <h3 style={{ ...styles.cardTitle, color: colors.text }}>{card.title}</h3>
              <p style={{ ...styles.cardDesc, color: colors.muted }}>{card.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  themeToggle: {
    fontFamily: fonts.mono,
    fontSize: "12px",
    padding: "6px 12px",
    background: "transparent",
    border: "1px solid",
    borderRadius: "6px",
    cursor: "pointer",
  },
  titleBar: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "10px 20px",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    display: "inline-block",
  },
  titleBarText: {
    fontFamily: fonts.mono,
    fontSize: "13px",
    flex: 1,
  },
  clock: {
    fontFamily: fonts.mono,
    fontSize: "12px",
  },
  avatarLink: {
    textDecoration: "none",
  },
  avatarCircle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    fontFamily: fonts.mono,
    fontSize: "13px",
    fontWeight: 600,
    transition: "border-color 0.15s ease",
  },
  logoutBtn: {
    fontFamily: fonts.mono,
    padding: "6px 14px",
    backgroundColor: "transparent",
    border: "1px solid",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
  },
  content: {
    maxWidth: "960px",
    margin: "0 auto",
    padding: "50px 24px",
  },
  headerRow: {
    marginBottom: "40px",
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: "13px",
    margin: "0 0 8px 0",
    letterSpacing: "0.5px",
  },
  h1: {
    fontSize: "32px",
    margin: "0 0 8px 0",
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  card: {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    borderRadius: "8px",
    padding: "20px",
  },
  cmdLabel: {
    fontFamily: fonts.mono,
    fontSize: "12px",
    margin: "0 0 10px 0",
  },
  cardTitle: {
    fontSize: "17px",
    margin: "0 0 6px 0",
  },
  cardDesc: {
    fontSize: "13px",
    margin: 0,
    lineHeight: "1.4",
  },
};

export default Dashboard;