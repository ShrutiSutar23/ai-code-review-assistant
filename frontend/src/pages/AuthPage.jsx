import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

function AuthPage() {
  const { colors } = useTheme();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setMessage("");
    const endpoint = isRegister ? "/auth/register" : "/auth/login";

    try {
      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, { email, password });

      if (isRegister) {
        setMessage("Registered! You can now log in.");
        setIsRegister(false);
      } else {
        localStorage.setItem("user_email", response.data.user);
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/");
      }
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong.");
    }
  };

  const handleForgotPassword = async () => {
    setResetMessage("");
    if (!email) {
      setResetMessage("Please enter your email above first.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/auth/forgot-password", { email });
      setResetMessage(response.data.message);
    } catch (err) {
      setResetMessage(err.response?.data?.error || "Failed to send reset email.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
        <p style={{ ...styles.eyebrow, color: colors.teal }}>~/auth</p>
        <h1 style={{ ...styles.h1, color: colors.text }}>{isRegister ? "Register" : "Login"}</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ ...styles.input, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ ...styles.input, backgroundColor: colors.bg, border: `1px solid ${colors.border}`, color: colors.text }}
        />
        <button onClick={handleSubmit} style={{ ...styles.primaryBtn, backgroundColor: colors.teal }}>
          {isRegister ? "Register" : "Login"}
        </button>

        {message && (
          <p style={{ color: message.includes("Registered") ? colors.green : colors.red, fontSize: "13px", marginTop: "10px" }}>
            {message}
          </p>
        )}

        <p
          style={{ ...styles.linkText, color: colors.teal }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? "Already have an account? Login" : "Need an account? Register"}
        </p>

        {!isRegister && (
          <p
            style={{ ...styles.linkText, color: colors.muted, fontSize: "13px", marginTop: "6px" }}
            onClick={handleForgotPassword}
          >
            Forgot Password?
          </p>
        )}

        {resetMessage && <p style={{ color: colors.green, fontSize: "13px" }}>{resetMessage}</p>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    maxWidth: "380px",
    width: "100%",
    margin: "0 20px",
    borderRadius: "10px",
    padding: "32px",
  },
  eyebrow: {
    fontFamily: fonts.mono,
    fontSize: "13px",
    margin: "0 0 8px 0",
    textAlign: "center",
  },
  h1: {
    fontSize: "24px",
    margin: "0 0 20px 0",
    fontWeight: 600,
    textAlign: "center",
  },
  input: {
    padding: "10px",
    width: "100%",
    marginBottom: "12px",
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
  linkText: {
    marginTop: "18px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "center",
  },
};

export default AuthPage;