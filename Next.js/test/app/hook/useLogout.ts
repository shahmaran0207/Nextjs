import { useCallback } from "react";

export function useLogout() {
    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
        } catch (err) {
            console.error("로그아웃 실패:", err);
        } finally {
            localStorage.removeItem("token");
            window.location.href = "/Login";
        }
    }, []);

    return { logout };
}