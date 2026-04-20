"use client"

import useAuth from "../hook/useAuth";

export default function EmailVerify() {

    const { handleSend, email, setEmail, message, handleVerify, verified,
         sent, code, setCode
        } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-e6 p-6">
            <h1 className="text-2xl font-bold">이메일 인증</h1>

            <input 
                type="email"
                placeholder="이메일 주소 입력"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border px-4 py-2 rounded w-72"
                disabled={sent}/>

            {!sent ? (
                <button
                    onClick={handleSend}
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                    인증코드 보내기
                </button>
            ):(
                <>
                    <input
                        type="text"
                        placeholder="인증코드 입력"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="border px-4 py-2 rounded w-72"/>
                    <button
                        onClick={handleVerify}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                            인증하기
                        </button>
                </>
            )}
            {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
            {verified && (
                <p className="text-green-600 font-semibold mt-2">인증 완료</p>
            )}
        </div>
    )
}