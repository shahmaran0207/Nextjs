'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Settings() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isLinked, setIsLinked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // JWT 토큰으로 사용자 정보 확인
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/Login");
            return;
        }

        // 사용자 정보 가져오기 (네이버 연동 상태 포함)
        const fetchUserInfo = async () => {
            try {
                const response = await fetch("/api/auth/Me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData);
                    setIsLinked(!!userData.naver_id); // 네이버 ID가 있으면 연동됨
                } else {
                    router.push("/Login");
                    return;
                }
            } catch (error) {
                console.error("사용자 정보 가져오기 실패:", error);
                router.push("/Login");
                return;
            }

            setLoading(false);
        };

        // URL 파라미터 확인
        const params = new URLSearchParams(window.location.search);
        const success = params.get("success");
        const error = params.get("error");

        if (success) {
            setMessage("네이버 계정이 연동되었습니다!");
            setIsLinked(true);
        } else if (error) {
            setMessage(error);
        }

        fetchUserInfo();
    }, [router]);

    async function handleLinkNaver() {
        try {
            setLoading(true);
            setMessage("");

            // 네이버 OAuth URL로 리다이렉트 (연동 모드)
            // state 파라미터에 현재 사용자 ID를 포함
            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("로그인이 필요합니다");
                return;
            }

            // JWT 토큰에서 사용자 ID 추출
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.id;

                // 네이버 OAuth 시작 - 사용자 ID를 파라미터로 전달
                window.location.href = `/api/auth/naver/link?userId=${userId}`;
            } catch (error) {
                console.error("토큰 파싱 오류:", error);
                setMessage("유효하지 않은 토큰입니다");
                return;
            }

        } catch (error) {
            console.error("[LINK NAVER ERROR]", error);
            setMessage("네이버 계정 연동에 실패했습니다");
            setLoading(false);
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <p className="text-slate-400">로딩 중...</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">계정 설정</h1>

                <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-900/50 rounded-2xl p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">계정 정보</h3>
                        <p className="text-slate-400">이메일: {user?.email}</p>
                        <p className="text-slate-400">이름: {user?.name}</p>
                    </div>

                    <hr className="border-slate-700 my-6" />

                    {/* 네이버 계정 연동 섹션 - 연동되지 않은 경우에만 표시 */}
                    {!isLinked && (
                        <>
                            <h2 className="text-xl font-semibold text-white mb-4">네이버 계정 연동</h2>
                            <p className="text-slate-400 mb-6">
                                네이버 계정을 연동하면 네이버 로그인으로도 접속할 수 있습니다.
                            </p>
                        </>
                    )}

                    {/* 네이버 연동 상태 표시 */}
                    {isLinked ? (<></>
                    ) : (
                        <button
                            onClick={handleLinkNaver}
                            disabled={loading}
                            className="w-full h-12 bg-[#03C75A] hover:bg-[#02b350] disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {
                                loading ? (
                                    "연동 중..."
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13.3333 10.8333L6.66667 0H0V20H6.66667V9.16667L13.3333 20H20V0H13.3333V10.8333Z" fill="white" />
                                        </svg>
                                        <span>네이버 계정 연동하기</span>
                                    </>
                                )}
                        </button>
                    )
                    }

                    {
                        message && (
                            <div className={`mt-4 p-3 rounded-lg text-sm ${message.includes("성공") || message.includes("연동되었습니다")
                                ? "bg-green-900/30 border border-green-500/50 text-green-400"
                                : "bg-red-900/30 border border-red-500/50 text-red-400"
                                }`}>
                                {message}
                            </div>
                        )
                    }
                </div >

                <button
                    onClick={() => router.push("/")}
                    className="mt-6 text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                    ← 홈으로 돌아가기
                </button>
            </div >
        </div >
    );
}
