function Dashboard() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Code Review Dashboard</h1>
      <p>Welcome to your AI Code Review Assistant!</p>

      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = "/auth";
        }}
        style={{ padding: "8px 16px", marginTop: "20px" }}
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard;