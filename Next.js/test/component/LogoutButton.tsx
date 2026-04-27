"use client";
import { useEffect, useState } from "react";
import { useLogout } from "@/app/hook/useLogout";
import { useRouter } from "next/navigation";

export function LogoutButton() {
    const { logout } = useLogout();
    const router = useRouter();
    
    // 지연 초기화를 통해 클라이언트 사이드에서 즉시 localStorage의 값을 읽어옵니다.
    // 이렇게 하면 뒤로 가기나 클라이언트 라우팅 시 '로그인' 버튼이 보였다가 바뀌는 현상을 방지할 수 있습니다.
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            setIsLoggedIn(!!token);
        };

        // 즉시 실행
        checkAuth();

        // 0.1초 뒤 한 번 더 실행 (Next.js 캐시 복원 지연 대비)
        const timer = setTimeout(checkAuth, 100);

        // 다양한 브라우저/라우팅 이벤트 감지
        window.addEventListener("storage", checkAuth);
        window.addEventListener("loginStateChange", checkAuth);
        window.addEventListener("pageshow", checkAuth); 
        window.addEventListener("popstate", checkAuth);
        window.addEventListener("focus", checkAuth);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("storage", checkAuth);
            window.removeEventListener("loginStateChange", checkAuth);
            window.removeEventListener("pageshow", checkAuth);
            window.removeEventListener("popstate", checkAuth);
            window.removeEventListener("focus", checkAuth);
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