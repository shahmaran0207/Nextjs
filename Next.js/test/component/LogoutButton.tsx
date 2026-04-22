import { useLogout } from "@/app/hook/useLogout";

export function LogoutButton() {
    const { logout } = useLogout();

    return (
        <button
            onClick={logout}
            style={{
                padding: "6px 14px",
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: "8px",
                color: "#38bdf8",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.18)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#38bdf8";
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(56,189,248,0.08)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(56,189,248,0.3)";
            }}
        >
            로그아웃
        </button>
    );
}