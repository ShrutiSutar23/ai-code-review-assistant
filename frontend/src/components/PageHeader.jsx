import { Link } from "react-router-dom";
import { fonts } from "../theme";
import { useTheme } from "../context/ThemeContext";

function PageHeader({ eyebrow, title, subtitle }) {
  const { colors } = useTheme();

  return (
    <div style={{ marginBottom: "36px" }}>
      <Link to="/" style={{ ...styles.backLink, color: colors.muted }}>← dashboard</Link>
      <p style={{ ...styles.eyebrow, color: colors.teal }}>{eyebrow}</p>
      <h1 style={{ ...styles.h1, color: colors.text }}>{title}</h1>
      {subtitle && <p style={{ ...styles.subtitle, color: colors.muted }}>{subtitle}</p>}
    </div>
  );
}

const styles = {
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
    fontSize: "28px",
    margin: "0 0 8px 0",
    fontWeight: 600,
  },
  subtitle: {
    margin: 0,
    fontSize: "14px",
  },
};

export default PageHeader;