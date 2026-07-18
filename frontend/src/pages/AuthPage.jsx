import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
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

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
      <h1>{isRegister ? "Register" : "Login"}</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: "8px", width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleSubmit} style={{ padding: "10px 20px", width: "100%" }}>
        {isRegister ? "Register" : "Login"}
      </button>

      {message && <p style={{ color: message.includes("Registered") ? "green" : "red" }}>{message}</p>}

      <p style={{ marginTop: "20px", cursor: "pointer", color: "#0077cc" }} onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "Need an account? Register"}
      </p>
    </div>
  );
}

export default AuthPage;