"use client";

import { useEffect, useState } from "react";

/**
 * 인증 상태를 확인하고, 비인증 시 로그인 페이지로 리다이렉트하는 커스텀 훅
 * 로그인 페이지를 제외한 모든 페이지에서 사용하세요.
 * 
 * 사용법:
 *   import { useAuthGuard } from "@/app/hooks/useAuthGuard";
 *   export default function Page() {
 *     const { email } = useAuthGuard();
 *     return <div>...</div>;
 *   }
 */
export function useAuthGuard() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch("/api/auth/Me", {
        credentials: 'include',
      });

      // accessToken 만료 시 refresh 시도
      if (res.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: 'include',
        });

        if (!refreshRes.ok) {
          // refresh도 실패하면 로그인 페이지로
          window.location.href = "/Login";
          return;
        }

        // refresh 성공 → 다시 Me 호출
        const retryRes = await fetch("/api/auth/Me", {
          credentials: 'include',
        });

        if (!retryRes.ok) {
          window.location.href = "/Login";
          return;
        }

        const retryData = await retryRes.json();
        setEmail(retryData.email);
        return;
      }

      const data = await res.json();
      setEmail(data.email);
    };
    checkAuth();
  }, []);

  return { email };
}
