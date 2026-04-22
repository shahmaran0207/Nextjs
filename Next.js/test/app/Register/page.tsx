'use client'

import postStyle from "../hook/postStyle";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../hook/useAuth";

export default function Login() {
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
    const router = useRouter();

    const { labelStyle, inputStyle, dark } = postStyle();

    const { handleSend, email, setEmail, message, handleVerify, verified,
        sent, code, setCode
    } = useAuth();

    // 모든 검증을 통과해야 회원가입 버튼 활성화
    // 1. 이메일 인증 완료 (verified)
    // 2. 이름 중복 없음 (!errors.name)
    // 3. 이메일 중복 없음 (!errors.email)
    // 4. 모든 필드 입력됨 (name, email, password)
    const canRegister = verified && !errors.name && !errors.email && name.trim() && email.trim() && password.trim();

    // 이름 입력칸에서 포커스가 빠져나갈 때 이름 중복 검증
    async function handleNameBlur() {
        if (!name.trim()) return;

        const res = await fetch(`/api/auth/CheckDuplicate?field=name&value=${encodeURIComponent(name)}`);
        const data = await res.json();

        if (data.isDuplicate) {
            setErrors((prev) => ({ ...prev, name: "이미 사용 중인 이름입니다." }));
        } else {
            setErrors((prev) => ({ ...prev, name: undefined }));
        }
    }

    // 이메일 입력칸에서 포커스가 빠져나갈 때 이메일 중복 검증
    async function handleEmailBlur() {
        if (!email.trim()) return;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }));
            return;
        }

        const res = await fetch(`/api/auth/CheckDuplicate?field=email&value=${encodeURIComponent(email)}`);
        const data = await res.json();

        if (data.isDuplicate) {
            setErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
        } else {
            setErrors((prev) => ({ ...prev, email: undefined }));
        }
    }

    async function handleRegister(e: React.FormEvent) {
        e.preventDefault();

        // 모든 검증이 통과되지 않으면 회원가입 진행하지 않음
        if (!canRegister) {
            alert("모든 필수 항목을 입력하고 인증을 완료해주세요.");
            return;
        }

        const res = await fetch("/api/auth/Register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        if (res.status === 200) {
            alert("회원가입이 완료되었습니다!");
            router.push("/Login"); // 회원가입 성공 시 로그인 페이지로 이동
        } else if (res.status === 409) {
            // onBlur에서 이미 잡히지만, 혹시 통과된 경우에도 처리
            const data = await res.json();
            if (data.field === "name") {
                setErrors((prev) => ({ ...prev, name: data.err }));
            } else if (data.field === "email") {
                setErrors((prev) => ({ ...prev, email: data.err }));
            }
        } else {
            alert("회원가입 실패. 다시 시도해주세요.");
        }
    };

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
                        ✍️
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            회원가입
                        </h1>
                    </div>
                </div>

                <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <a
                        href="/"
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
                        홈으로
                    </a>
                </nav>
            </header>
            <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 py-16">
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

                    {/* 타이틀 영역 */}
                    <h1 className="text-2xl font-semibold text-white mb-2">디지털 트윈 시스템 회원가입</h1>

                    {/* 이메일/아이디 입력란 */}
                    <form onSubmit={handleRegister}>
                        {/* 이름 입력란 */}
                        <div className="mb-5">
                            <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">
                                Name
                            </label>
                            <input
                                type="text"
                                placeholder="사용자 이름"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    // 입력값이 바뀌면 이름 에러 초기화
                                    setErrors((prev) => ({ ...prev, name: undefined }));
                                }}
                                onBlur={handleNameBlur}
                                required
                                className={`w-full h-11 border rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:ring-1 placeholder:text-slate-600 transition-all shadow-inner ${errors.name
                                    ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                                    : "border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-400/50"
                                    }`}
                            />
                            {/* 이름 중복 경고 */}
                            {errors.name && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <span>⚠</span> {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="mb-5">
                            <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">
                                User ID
                            </label>
                            <input
                                type="email"
                                placeholder="admin@system.local"
                                value={email}
                                disabled={sent}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    // 입력값이 바뀌면 이메일 에러 초기화
                                    setErrors((prev) => ({ ...prev, email: undefined }));
                                }}
                                onBlur={handleEmailBlur}
                                required
                                className={`w-full h-11 border rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:ring-1 placeholder:text-slate-600 transition-all shadow-inner ${errors.email
                                    ? "border-red-500 focus:border-red-400 focus:ring-red-400/50"
                                    : "border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-400/50"
                                    }`}
                            />
                            {/* 이메일 중복 경고 */}
                            {errors.email && (
                                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                    <span>⚠</span> {errors.email}
                                </p>
                            )}
                            <div className="mt-3">
                                {!sent ? (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!email.trim()) {
                                                alert("이메일을 입력해주세요.");
                                                return;
                                            }
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            if (!emailRegex.test(email)) {
                                                alert("올바른 이메일 형식이 아닙니다.");
                                                return;
                                            }
                                            if (errors.email) {
                                                alert(errors.email);
                                                return;
                                            }
                                            handleSend();
                                        }}
                                        className="w-full h-11 border border-slate-600/50 bg-slate-800/40 text-slate-300 text-sm rounded-lg hover:bg-slate-700/50 hover:text-white transition-all hover:border-slate-500"
                                    >
                                        인증코드 발송
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="인증코드 6자리"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            className="flex-1 h-11 border border-slate-700/80 rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-slate-600 transition-all shadow-inner"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleVerify}
                                            className="h-11 px-6 border border-cyan-500/50 bg-cyan-900/40 text-cyan-400 text-sm rounded-lg hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-300 transition-all whitespace-nowrap"
                                        >
                                            인증 확인
                                        </button>
                                    </div>
                                )}
                            </div>
                            {message && <p className="mt-2 text-xs text-slate-400">{message}</p>}
                            {verified && (
                                <p className="mt-2 text-xs text-green-400 flex items-center gap-1">
                                    <span>✓</span> 이메일 인증이 완료되었습니다.
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 입력란 */}
                        <div className="mb-5">
                            <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">
                                Security Key
                            </label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full h-11 border border-slate-700/80 rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-slate-600 transition-all shadow-inner"
                            />
                        </div>


                        {/* 회원가입 버튼 */}
                        {/* 모든 검증을 통과해야 버튼 활성화 */}
                        <button
                            type="submit"
                            disabled={!canRegister}
                            className={`relative w-full h-12 border text-sm font-semibold tracking-wider rounded-lg transition-all overflow-hidden ${!canRegister
                                ? "bg-slate-800/40 border-slate-600/50 text-slate-500 cursor-not-allowed opacity-60"
                                : "bg-cyan-900/40 border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-[0.98] text-cyan-400 hover:text-cyan-300 cursor-pointer"
                                }`}
                        >
                            <span className="relative z-10 block">회원 가입</span>
                        </button>

                        {/* 회원가입 조건 안내 */}
                        {!canRegister && (
                            <div className="mt-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
                                <p className="text-xs text-slate-400 mb-2">회원가입을 위해 다음을 완료해주세요:</p>
                                <ul className="text-xs space-y-1">
                                    <li className={verified ? "text-green-400" : "text-slate-500"}>
                                        {verified ? "✓" : "○"} 이메일 인증
                                    </li>
                                    <li className={name.trim() && !errors.name ? "text-green-400" : "text-slate-500"}>
                                        {name.trim() && !errors.name ? "✓" : "○"} 이름 중복 확인
                                    </li>
                                    <li className={email.trim() && !errors.email ? "text-green-400" : "text-slate-500"}>
                                        {email.trim() && !errors.email ? "✓" : "○"} 이메일 중복 확인
                                    </li>
                                    <li className={password.trim() ? "text-green-400" : "text-slate-500"}>
                                        {password.trim() ? "✓" : "○"} 비밀번호 입력
                                    </li>
                                </ul>
                            </div>
                        )}
                    </form>

                </div>
            </div>
        </>
    );
}