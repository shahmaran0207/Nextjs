"use client"

import { useSession } from "next-auth/react";
import { useRef, useState } from "react";

export default function useAuth() {
    const sessionData = useSession();
    const session = sessionData?.data;
    const update = sessionData?.update;

    const [ email, setEmail ] = useState("");
    const [ message, setMessage ] = useState("");
    const [ code, setCode ] = useState("");
    const [ nameError, setNameError] = useState("");
    const [name, setName] = useState("");

    const [ verified, setVerified ] = useState(false);
    const [ checking, setChecking ] = useState(false);
    const [ showModal, setShowModal ] = useState(false);
    const [ sent, setSent ] = useState(false);

    const registered = useRef(false);

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

    return { 
        handleSend, email, setEmail, message, setMessage, handleVerify,
        verified, setVerified, sent, setSent, code, setCode, checkDuplicate,
        nameError, setNameError, checking, setChecking, registered,
        showModal, setShowModal, handleRegister, name, setName,
        data: session, update 
    };

};