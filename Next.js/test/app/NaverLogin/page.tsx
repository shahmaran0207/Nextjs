"use client"

import { signIn, signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

export default function LoginPage() {
    const { data: session, update } = useSession();
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState("");
    const [nameError, setNameError] = useState("");
    const [checking, setChecking] = useState(false);
    const registered = useRef(false);

    useEffect(() => {
        if (!registered.current && (session?.user as any)?.isNewUser) {
            setShowModal(true);
        }
    }, [session]);

    const checkDuplicate = async (value: string) => {
        if (!value.trim()) {
            setNameError("");
            return;
        }
        setChecking(true);
        const res = await fetch(`/api/Users/checkName?name=${encodeURIComponent(value)}`);
        const data = await res.json();
        setNameError(data.exists ? "이미 사용 중인 닉네임이에요." : "");
        setChecking(false);
    };

    const handleRegister = async () => {
        if (!name.trim() || nameError || checking) return;

        registered.current = true;
        const res = await fetch("/api/Users/register", {
            method: "POST",
            body: JSON.stringify({ name }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            await update();
            setShowModal(false);
        } else {
            registered.current = false;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
            {session ? (
                <>
                    <p className="text-lg font-semibold">{session.user?.name}님 환영합니다 👋</p>
                    <p className="text-gray-500">{session.user?.email}</p>
                    <button
                        onClick={() => signOut()}
                        className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                        로그아웃
                    </button>
                </>
            ) : (
                <>
                    <h1 className="text-2xl font-bold">로그인</h1>
                    <button
                        onClick={() => signIn("naver")}
                        className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                        네이버로 로그인
                    </button>
                </>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg flex flex-col gap-4 w-80">
                        <h2 className="text-xl font-bold">닉네임 입력</h2>
                        <p className="text-gray-500 text-sm">사용할 닉네임을 입력해주세요</p>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                checkDuplicate(e.target.value);
                            }}
                            placeholder="닉네임 입력"
                            className="border px-3 py-2 rounded" />
                        {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
                        <button
                            onClick={handleRegister}
                            disabled={!name.trim() || !!nameError || checking}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
