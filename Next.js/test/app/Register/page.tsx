'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/auth/Register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            router.push("/"); // 로그인 성공 시 메인 페이지로 이동
        } else {
            alert("로그인 실패: " + (data.err ?? "알 수 없는 오류"));
        }
    };

    return (
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

                {/* 타이틀 영역 */}
                <h1 className="text-2xl font-semibold text-white mb-2">디지털 트윈 시스템 회원가입</h1>

                {/* 이메일/아이디 입력란 */}
                <form onSubmit={handleLogin}>
                    {/* 이름 입력란 */}
                    <div className="mb-5">
                        <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">
                            Name
                        </label>
                        <input
                            type="text"
                            placeholder="사용자 이름"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full h-11 border border-slate-700/80 rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-slate-600 transition-all shadow-inner"
                        />
                    </div>

                    <div className="mb-5">
                        <label className="block text-xs font-mono text-cyan-500 mb-2 uppercase tracking-[0.15em]">
                            User ID
                        </label>
                        <input
                            type="email"
                            placeholder="admin@system.local"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full h-11 border border-slate-700/80 rounded-lg px-4 text-sm bg-slate-950/60 text-cyan-50 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 placeholder:text-slate-600 transition-all shadow-inner"
                        />
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


                    {/* 로그인 버튼 */}
                    <button type="submit" className="relative w-full h-12 bg-cyan-900/40 border border-cyan-500/50 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] active:scale-[0.98] text-cyan-400 hover:text-cyan-300 text-sm font-semibold tracking-wider rounded-lg transition-all overflow-hidden">
                        <span className="relative z-10 block">회원 가입</span>
                    </button>
                </form>

            </div>
        </div>
    );
}