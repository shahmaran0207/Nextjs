export default function postStyle() {
    const dark = {
      bg: "#0a0e1a",
      surface: "#1a1d27",
      surface2: "#22263a",
      border: "rgba(56,189,248,0.15)",
      textPrimary: "#e8eaf0",
      textSecondary: "#8b90a7",
      textMuted: "#545874",
      accent: "#38bdf8",
      accentDim: "rgba(56,189,248,0.1)",
    };

    const inputStyle: React.CSSProperties = {
        width: "100%",
        padding: "10px 14px",
        fontSize: "14px",
        border: `1.5px solid ${dark.border}`,
        borderRadius: "10px",
        background: dark.surface2,
        color: dark.textPrimary,
        outline: "none",
        boxSizing: "border-box",
        transition: "border-color 0.2s",
        fontFamily: "inherit",
    };

    const labelStyle: React.CSSProperties = {
        display: "block",
        fontSize: "11px",
        fontWeight: 600,
        color: dark.textMuted,
        marginBottom: "6px",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
    };

    return {
        labelStyle, inputStyle, dark
    }
}