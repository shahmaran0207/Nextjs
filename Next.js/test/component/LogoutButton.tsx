import { useEffect, useState } from "react";
import { useLogout } from "@/app/hook/useLogout";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const { logout } = useLogout();
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // URL에서 토큰을 직접 확인 (컴포넌트 마운트 순서 문제 해결)
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        if (urlToken) {
            localStorage.setItem("token", urlToken);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        // 초기 상태 확인
        checkAuth();

        // 다른 탭이나 같은 탭에서의 스토리지 변경 감지
        window.addEventListener("storage", checkAuth);
        window.addEventListener("loginStateChange", checkAuth);

        return () => {
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("loginStateChange", checkAuth);
        };
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