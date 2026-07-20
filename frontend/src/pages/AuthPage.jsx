import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import { API_URL } from "../apiConfig";

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
      const response = await axios.post(`${API_URL}${endpoint}`, { email, password });

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
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setResetMessage(response.data.message);
    } catch (err) {
      setResetMessage(err.response?.data?.error || "Failed to send reset email.");
    }
  };

  const handleGithubLogin = () => {
    const supabaseUrl = "https://iozlepmyruwsdoqlshob.supabase.co";
    const redirectTo = encodeURIComponent(`${window.location.origin}/oauth-callback`);
    window.location.href = `${supabaseUrl}/auth/v1/authorize?provider=github&redirect_to=${redirectTo}`;
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

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
          <span style={{ fontSize: "12px", color: colors.muted }}>OR</span>
          <div style={{ flex: 1, height: "1px", backgroundColor: colors.border }} />
        </div>

        <button
          onClick={handleGithubLogin}
          style={{
            ...styles.primaryBtn,
            backgroundColor: "transparent",
            border: `1px solid ${colors.border}`,
            color: colors.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill={colors.text}>
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          Continue with GitHub
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