'use client'

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import postStyle from "../hook/postStyle";
import { ethers } from "ethers";

// ✅ useSearchParams를 사용하는 부분만 별도 컴포넌트로 분리
function LoginInner() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [userInfo, setUserInfo] = useState<any>(null);
    const [showNaverLogin, setShowNaverLogin] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { labelStyle, inputStyle, dark } = postStyle();

    useEffect(() => {
        const checkUserInfo = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await fetch("/api/auth/Me", {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setUserInfo(data);
                        setShowNaverLogin(!data.naver_id);
                    }
                } catch (error) {
                    console.error("사용자 정보 확인 실패:", error);
                }
            }
        };
        checkUserInfo();
    }, []);

    useEffect(() => {
        const errorParam = searchParams.get("error");
        if (errorParam) {
            if (errorParam.includes("연동된 계정이 없습니다")) {
                setError("연동된 계정이 없습니다. 먼저 일반 로그인 후 설정에서 네이버 계정을 연동하세요.");
            } else {
                setError(errorParam);
            }
        }
    }, [searchParams]);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/Login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (data.accessToken) {
            localStorage.setItem("token", data.accessToken);
            setShowNaverLogin(!data.user.hasNaverLink);
            router.push("/");
        } else {
            setError("로그인 실패: " + (data.err ?? "알 수 없는 오류"));
        }
    }

    async function handleNaverLogin() {
        try {
            setError("");
            window.location.href = `/api/auth/naver/signin?callbackUrl=${encodeURIComponent("/api/auth/callback/naver")}`;
        } catch (error) {
            console.error("[NAVER LOGIN ERROR]", error);
            setError("네이버 로그인에 실패했습니다");
        }
    }

    // ── Web3 (SIWE) 로그인 핸들러 ──
    async function handleWeb3Login() {
        try {
            setError("");
            if (typeof window === "undefined" || !(window as any).ethereum) {
                setError("MetaMask가 설치되어 있지 않습니다.");
                return;
            }

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            
            // 1. 지갑 연결 (계정 가져오기)
            const accounts = await provider.send("eth_requestAccounts", []);
            const account = accounts[0];

            // 2. 서명할 메시지 준비 (Nonce 등 보안 요소를 넣는 것이 좋지만, 교육용으로 간단하게 작성)
            const message = `TwinSystem 로그인\n\n지갑 주소: ${account}\n시간: ${new Date().toISOString()}`;

            // 3. 메타마스크에 팝업을 띄워 서명(Sign) 요청
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);

            console.log("서명된 메시지:", signature);

            // 4. 이 서명과 메시지를 백엔드로 보내서 진짜 주인이 맞는지 검증하고 토큰을 발급받습니다.
            const res = await fetch("/api/auth/web3-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account, message, signature }),
            });

            const data = await res.json();

            if (data.accessToken) {
                // 검증 성공! 일반 로그인과 동일하게 처리
                localStorage.setItem("token", data.accessToken);
                router.push("/");
            } else {
                setError("Web3 로그인 실패: " + (data.err ?? "알 수 없는 오류"));
            }

        } catch (error: any) {
            console.error("[WEB3 LOGIN ERROR]", error);
            setError("Web3 로그인 중 오류가 발생했습니다: " + (error.message || ""));
        }
    }

    return (
        <>
            <header style={{
                background: "rgba(10, 14, 26, 0.95)",
                borderBottom: `1px solid ${dark.border}`,
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
                        width: "32px", height: "32px",
                        background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                        borderRadius: "8px", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 16px rgba(56,189,248,0.4)", fontSize: "16px",
                    }}>✍️</div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            로그인
                        </h1>
                    </div>
                </div>
                <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <a href="/" style={{
                        fontSize: "13px", color: "#8b90a7", textDecoration: "none",
                        padding: "6px 12px", borderRadius: "8px",
                        border: "1px solid rgba(255,255,255,0.08)", transition: "color 0.15s, border-color 0.15s",
                    }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.color = "#8b90a7";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                        }}
                    >홈으로</a>
                </nav>
            </header>

            <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
                    <div className="absolute w-full h-full opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative z-10 bg-slate-900/70 backdrop-blur-xl border border-cyan-900/50 rounded-2xl p-10 w-full max-w-md shadow-[0_0_30px_rgba(8,145,178,0.15)]">
                    <div className="mb-8 flex items-center">
                        <div className="relative flex items-center justify-center w-8 h-8 mr-3">
                            <span className="absolute inset-0 rounded-full bg-cyan-400/30 blur-md animate-pulse"></span>
                            <span className="relative w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        </div>
                        <span className="font-mono text-xl text-cyan-50 tracking-wider font-semibold">TwinSystem</span>
                    </div>

                    <h1 className="text-2xl font-semibold text-white mb-2">디지털 트윈 시스템 로그인</h1>
                    <p className="text-sm text-slate-400 mb-8 font-light">관제 플랫폼에 접속하기 위해 인증을 진행하세요</p>

                    <form onSubmit={handleLogin}>
                        <div className="mb-5">
                            <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">User ID</label>
                            <input type="email" placeholder="admin@system.local" value={email}
                                onChange={(e) => setEmail(e.target.value)} required
                                className="w-full h-11 border border-slate-700/80 rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-slate-600 transition-all shadow-inner"
                            />
                        </div>
                        <div className="mb-5">
                            <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">Security Key</label>
                            <input type="password" placeholder="••••••••" value={password}
                                onChange={(e) => setPassword(e.target.value)} required
                                className="w-full h-11 border border-slate-700/80 rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-slate-600 transition-all shadow-inner"
                            />
                        </div>
                        <button type="submit" className="relative w-full h-12 bg-cyan-900/40 border border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-[0.98] text-cyan-400 hover:text-cyan-300 text-sm font-semibold tracking-wider rounded-lg transition-all overflow-hidden">
                            <span className="relative z-10 block">로그인</span>
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-700" />
                        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-slate-700" />
                    </div>

                    {showNaverLogin && (
                        <>
                            <button type="button" onClick={handleNaverLogin}
                                className="relative w-full h-12 bg-[#03C75A] hover:bg-[#02b350] active:scale-[0.98] text-white text-sm font-semibold rounded-lg transition-all overflow-hidden flex items-center justify-center gap-2 shadow-lg"
                            >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.3333 10.8333L6.66667 0H0V20H6.66667V9.16667L13.3333 20H20V0H13.3333V10.8333Z" fill="white" />
                                </svg>
                                <span>네이버로 로그인</span>
                            </button>
                            <div className="flex items-center gap-4 my-6 mt-6">
                                <div className="flex-1 h-px bg-linear-to-r from-transparent to-slate-700" />
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">or</span>
                                <div className="flex-1 h-px bg-linear-to-r from-slate-700 to-transparent" />
                            </div>
                        </>
                    )}

                    {/* Web3 로그인 버튼 */}
                    <button type="button" onClick={handleWeb3Login}
                        className="relative w-full h-12 bg-[#f6851b] hover:bg-[#e2761b] active:scale-[0.98] text-white text-sm font-semibold rounded-lg transition-all overflow-hidden flex items-center justify-center gap-2 shadow-lg mb-6"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5H5a2 2 0 0 0 0 4" />
                        </svg>
                        <span>MetaMask로 로그인 (Web3)</span>
                    </button>

                    <p className="text-center text-sm text-slate-400">
                        시스템에 등록되지 않았나요?{" "}
                        <button onClick={() => router.push("/Register")} className="text-cyan-500 font-medium hover:text-cyan-400 hover:underline hover:underline-offset-4 transition-all">
                            회원가입
                        </button>
                    </p>
                </div>

                <div className="absolute bottom-5 right-5 text-mono text-xs text-slate-600">
                    SECURE_SYSTEM_V.1.0_ONLINE
                </div>
            </div>
        </>
    );
}

// ✅ 페이지 컴포넌트에서 Suspense로 감싸기
export default function Login() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-cyan-400 font-mono">Loading...</div>
            </div>
        }>
            <LoginInner />
        </Suspense>
    );
}