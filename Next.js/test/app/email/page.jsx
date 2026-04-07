"use client"

import { useState } from "react";

export default function EmailVerify() {
    const [ email, setEmail ] = useState("");
    const [ code, setCode ] = useState("");
    const [ sent, setSent ] = useState(false);
    const [ verified, setVerified ] = useState(false);
    const [ message, setMessage ] = useState("");

    const handleSend = async () => {
        try {
            const res = await fetch("/api/email/send", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email}),
            })

            const data = await res.json();
            if(res.ok) {
                setSent(true);
                setMessage("인증코드를 이메일로 전송하였습니다.");
            } else {
                setMessage(data.message || "메일 전송 실패")
            }
        } catch(err){
            setMessage("서버 오류 발생")
            console.log("이메일 인증코드 전송 에러::::::::::::", err)
        }
    };

    const handleVerify = async() => {
        try {
            const res = await fetch("/api/email/verify", {
                method: "POST",
                headers: { "Content-Type": "applicatino/json"},
                body: JSON.stringify({email, code}),
            })

            const data = await res.json();
            if(res.ok) {
                setVerified(true);
                setMessage("이메일 인증 성공!");
            } else {
                setMessage(data.message || "인증 실패");
            }
        } catch(err) {
            setMessage("서버 오류 발생");
            console.log("이메일 인증 오류:::::::::::::::", err);
        }
    };

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