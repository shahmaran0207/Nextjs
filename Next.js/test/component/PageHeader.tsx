import { LogoutButton } from "./LogoutButton";

interface NavLink {
    href: string;
    label: string;
}

interface PageHeaderProps {
    icon?: string;
    title: string;
    subtitle: string;
    navLinks?: NavLink[];
}

const defaultNavLinks: NavLink[] = [
    { href: "/", label: "홈으로" },
    { href: "/QnA", label: "문의사항" },
];

export function PageHeader({
    icon = "📄",
    title,
    subtitle,
    navLinks = defaultNavLinks,
}: PageHeaderProps) {
    return (
        <header style={{
            background: "rgba(10, 14, 26, 0.95)",
            borderBottom: "1px solid rgba(56,189,248,0.15)",
            padding: "0.75rem 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 200,
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                    width: "32px",
                    height: "32px",
                    background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 16px rgba(56,189,248,0.4)",
                    fontSize: "16px",
                }}>
                    {icon}
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                        {title}
                    </h1>
                    <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                        {subtitle}
                    </p>
                </div>
            </div>

            <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {navLinks.map(({ href, label }) => (
                    <a
                        key={href}
                        href={href}
                        style={{
                            fontSize: "13px",
                            color: "#8b90a7",
                            textDecoration: "none",
                            padding: "6px 12px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255,255,255,0.08)",
                            transition: "color 0.15s, border-color 0.15s",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = "#8b90a7";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                        }}
                    >
                        {label}
                    </a>
                ))}
                <LogoutButton />
            </nav>
        </header>
    );
}