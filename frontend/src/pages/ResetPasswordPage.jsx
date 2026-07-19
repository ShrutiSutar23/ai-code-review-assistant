import { useState, useEffect } from "react";
import axios from "axios";

function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    // Supabase sends the token in the URL hash, e.g. #access_token=xxxx&type=recovery
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace("#", "?"));
    const token = params.get("access_token");
    if (token) setAccessToken(token);
  }, []);

  const handleReset = async () => {
    if (!newPassword) {
      setMessage("Please enter a new password.");
      return;
    }
    if (!accessToken) {
      setMessage("Invalid or expired reset link. Please request a new one.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/auth/reset-password", {
        access_token: accessToken,
        new_password: newPassword
      });
      setMessage(response.data.message + " You can now log in with your new password.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to reset password.");
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h1>Reset Password</h1>

      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleReset} style={{ padding: "10px 20px", width: "100%" }}>
        Reset Password
      </button>

      {message && <p style={{ marginTop: "10px" }}>{message}</p>}
    </div>
  );
}

export default ResetPasswordPage;