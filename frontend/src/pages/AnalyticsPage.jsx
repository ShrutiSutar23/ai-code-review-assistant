import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";
import PageHeader from "../components/PageHeader";

function AnalyticsPage() {
  const { colors } = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/analytics")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load analytics."));
  }, []);

  const severityColors = { HIGH: colors.red, MEDIUM: colors.amber, LOW: colors.muted };
  const barColors = [colors.teal, colors.blue, colors.purple, colors.amber, colors.green, colors.red, colors.indigo];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: colors.bg, color: colors.text, fontFamily: fonts.sans }}>
      <div style={styles.content}>
        <PageHeader eyebrow="~/analytics" title="Repository Analytics" subtitle="Trends and breakdowns across all your reviews." />

        {error && <p style={{ color: colors.red }}>{error}</p>}

        {!data && !error && <p style={{ color: colors.muted }}>Loading analytics...</p>}

        {data && (
          <>
            {/* Summary stats */}
            <div style={styles.statGrid}>
              <StatBox label="Total Reviews" value={data.total_reviews} colors={colors} />
              <StatBox label="Total Findings" value={data.total_findings} colors={colors} />
              <StatBox label="Average Score" value={`${data.avg_score}/100`} colors={colors} />
            </div>

            {/* Score trend line chart */}
            <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
              <h3 style={{ ...styles.cardTitle, color: colors.text }}>Score Trend Over Time</h3>
              {data.score_trend.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.score_trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                    <XAxis dataKey="date" tick={{ fill: colors.muted, fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: colors.muted, fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }} />
                    <Line type="monotone" dataKey="score" stroke={colors.teal} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p style={{ color: colors.muted, fontSize: "13px" }}>No review data yet.</p>}
            </div>

            <div style={styles.twoColGrid}>
              {/* Severity breakdown pie chart */}
              <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 style={{ ...styles.cardTitle, color: colors.text }}>Findings by Severity</h3>
                {data.severity_breakdown.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={data.severity_breakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                      >
                        {data.severity_breakdown.map((entry, i) => (
                          <Cell key={i} fill={severityColors[entry.name] || colors.muted} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: colors.muted, fontSize: "13px" }}>No findings yet.</p>}
              </div>

              {/* Issue type breakdown bar chart */}
              <div style={{ ...styles.card, backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                <h3 style={{ ...styles.cardTitle, color: colors.text }}>Findings by Type</h3>
                {data.issue_breakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.issue_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="name" tick={{ fill: colors.muted, fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: colors.muted, fontSize: 11 }} />
                      <Tooltip contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, color: colors.text }} />
                      <Bar dataKey="value">
                        {data.issue_breakdown.map((entry, i) => (
                          <Cell key={i} fill={barColors[i % barColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p style={{ color: colors.muted, fontSize: "13px" }}>No findings yet.</p>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, colors }) {
  return (
    <div style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: "8px", padding: "16px", textAlign: "center" }}>
      <p style={{ fontSize: "22px", fontWeight: 700, color: colors.teal, margin: "0 0 4px 0" }}>{value}</p>
      <p style={{ fontSize: "12px", color: colors.muted, margin: 0, fontFamily: fonts.mono }}>{label}</p>
    </div>
  );
}

const styles = {
  content: { maxWidth: "900px", margin: "0 auto", padding: "50px 24px" },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  card: { borderRadius: "10px", padding: "20px", marginBottom: "20px" },
  cardTitle: { margin: "0 0 14px 0", fontSize: "15px" },
  twoColGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
};

export default AnalyticsPage;