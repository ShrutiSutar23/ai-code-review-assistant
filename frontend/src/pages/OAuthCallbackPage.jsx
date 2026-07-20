import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

function OAuthCallbackPage() {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [errorInfo, setErrorInfo] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const searchParams = new URLSearchParams(search);

    const accessToken = params.get("access_token");
    const error = params.get("error") || searchParams.get("error");
    const errorDescription = params.get("error_description") || searchParams.get("error_description");

    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      navigate("/");
    } else if (error) {
      setErrorInfo({ error, errorDescription });
    } else {
      setErrorInfo({ error: "unknown", errorDescription: "No token or error found in redirect. Full URL: " + window.location.href });
    }
  }, [navigate]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", padding: "20px", textAlign: "center" }}>
      {!errorInfo ? (
        <p style={{ color: colors.muted }}>Signing you in...</p>
      ) : (
        <div style={{ maxWidth: "500px" }}>
          <p style={{ color: colors.red, fontWeight: 600, marginBottom: "8px" }}>Login failed: {errorInfo.error}</p>
          <p style={{ color: colors.muted, fontSize: "13px" }}>{errorInfo.errorDescription}</p>
          <button
            onClick={() => navigate("/auth")}
            style={{ marginTop: "20px", padding: "8px 16px", backgroundColor: colors.teal, border: "none", borderRadius: "6px", cursor: "pointer", color: "#0D1117", fontFamily: fonts.mono }}
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default OAuthCallbackPage;