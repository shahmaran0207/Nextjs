'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";

export default function Web3Settings() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/Login");
            return;
        }

        // 사용자 정보 가져오기 (지갑 연동 상태 포함)
        const fetchUserInfo = async () => {
            try {
                const response = await fetch("/api/auth/Me", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    // 이미 지갑이 연동되어 있다면 접근 차단
                    if (userData.wallet_address) {
                        alert("이미 MetaMask 지갑이 연동되어 있습니다.");
                        router.push("/");
                        return;
                    }
                    setUser(userData);
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

        fetchUserInfo();
    }, [router]);

    // ── Web3 지갑 연동 로직 ──
    async function handleLinkWeb3() {
        try {
            setLoading(true);
            setMessage("");

            if (typeof window === "undefined" || !(window as any).ethereum) {
                setMessage("MetaMask가 설치되어 있지 않습니다.");
                setLoading(false);
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                setMessage("로그인이 필요합니다");
                setLoading(false);
                return;
            }

            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.id;

            const provider = new ethers.BrowserProvider((window as any).ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const account = accounts[0];

            const msg = `TwinSystem 연동 승인\n\n지갑 주소: ${account}\n시간: ${new Date().toISOString()}`;
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(msg);

            const res = await fetch("/api/auth/web3-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ account, message: msg, signature, userId }),
            });

            const data = await res.json();
            if (data.success) {
                alert("MetaMask 지갑이 성공적으로 연동되었습니다!");
                router.push("/");
            } else {
                setMessage(data.err || "연동에 실패했습니다.");
            }
        } catch (error: any) {
            console.error("[WEB3 LINK ERROR]", error);
            setMessage("Web3 지갑 연동 중 오류가 발생했습니다.");
        } finally {
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
                <h1 className="text-3xl font-bold text-white mb-8">MetaMask 지갑 연동</h1>

                <div className="bg-slate-900/70 backdrop-blur-xl border border-cyan-900/50 rounded-2xl p-8">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">현재 로그인된 계정 정보</h3>
                        <p className="text-slate-400">이메일: {user?.email}</p>
                        <p className="text-slate-400">이름: {user?.name}</p>
                    </div>

                    <hr className="border-slate-700 my-6" />

                    <div className="mb-8">
                        <p className="text-slate-400 mb-6">
                            암호화폐 결제 기능과 Web3 로그인을 사용하려면 MetaMask 지갑을 연동해 주세요.
                        </p>
                        <button
                            onClick={handleLinkWeb3}
                            disabled={loading}
                            className="w-full h-12 bg-[#f6851b] hover:bg-[#e2761b] disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? "진행 중..." : "MetaMask 지갑 연동하기"}
                        </button>
                    </div>

                    {message && (
                        <div className="mt-4 p-3 rounded-lg text-sm bg-red-900/30 border border-red-500/50 text-red-400">
                            {message}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="mt-6 text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                    ← 홈으로 돌아가기
                </button>
            </div>
        </div>
    );
}
