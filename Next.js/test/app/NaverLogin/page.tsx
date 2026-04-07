"use client"

import { signIn, signOut, useSession } from "next-auth/react";

export default function LoginPage() {
    const { data: session } = useSession();

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
        </div>
    );
}