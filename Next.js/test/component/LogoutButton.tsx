import { useEffect, useState } from "react";
import { useLogout } from "@/app/hook/useLogout";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const { logout } = useLogout();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        // token이 있거나 쿠키 검증을 위해 /api/auth/Me를 찔러볼 수 있지만
        // 간단히 토큰 여부로 판단
        setIsLoggedIn(!!token);
    }, []);

    const handleClick = () => {
        if (isLoggedIn) {
            logout();
        } else {
            router.push("/Login");
        }
    };

    return (
        <button
            onClick={handleClick}
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
            {isLoggedIn ? "로그아웃" : "로그인"}
        </button>
    );
}