'use client'

import { useState, useEffect, useRef } from "react"

interface ChatMessage {
    text: string;
    isSent: boolean;
    from: string;
    to?: string;
};

export default function ChatPage() {
    const [ message, setMessage ] = useState("");
    const [ messages, setMessages ] = useState<ChatMessage[]>([]);
    const [ userId, setUserId ] = useState<string | null>(null);
    const [ recepientId, setRecipientId ] = useState("");
    const [ mode, setMode ] = useState<'select' | 'new' | 'existing' | 'connected'>('select');
    const [ inputId, setInputId ] = useState("");
    const [ idError, setIdError ] = useState("");
    const socketRef = useRef<WebSocket | null>(null);

    // const connectWebSocket = async () => {
    //     await fetch('/api/ws');
    //     const ws = new WebSocket(`wss://${window.location.host}/ws`);

    //     ws.onopen = () => { console.log("WebSocket Connection established"); };
    //     ws.onmessage = (event) => {
    //         const data = JSON.parse(event.data);
    //         if(data.type === "id") {
    //             setUserId(data.id);
    //             setMode('connected');
    //         } else if(data.type === 'private' || data.type === 'broadcast') {
    //             setMessages((prev) => [...prev, { text: data.message, isSent: false, from: data.from }]);
    //         }
    //     };
    //     ws.onerror = (error) => { console.error('WebSocket error:', error); };
    //     ws.onclose = () => { console.log("WebSocket connection closed"); };
    //     socketRef.current = ws;
    // };

    const connectWebSocket = async () => {
        await fetch('/api/ws');

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname;
        const ws = new WebSocket(`${protocol}://${host}:3001`);

        ws.onopen = () => {
            console.log("WebSocket Connection established");
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "id") {
                setUserId(data.id);
                setMode('connected');
            } else if (data.type === 'private' || data.type === 'broadcast') {
                setMessages((prev) => [
                    ...prev,
                    { text: data.message, isSent: false, from: data.from }
                ]);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log("WebSocket connection closed");
        };

        socketRef.current = ws;
    };

    useEffect(() => {
        return () => {
            if(socketRef.current) socketRef.current.close();
        };
    }, []);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append("recepientId", recepientId);
            formData.append("userId", userId || "");
            formData.append("message", message);

            await fetch("/api/Chat/addChat", {
                method: "POST",
                body: formData,
            });
        } catch(err: any) {
            console.log("채팅 기록 저장 에러:::::::::", err);
        }

        if(message && socketRef.current && userId) {
            const messageData = recepientId ?
                { type: 'private', from: userId, to: recepientId, message } :
                { type: 'broadcast', from: userId, message };

            socketRef.current.send(JSON.stringify(messageData));
            setMessages((prevMessages) => [...prevMessages, {
                text: message,
                isSent: true,
                from: userId,
                to: recepientId || 'all'
            }]);
            setMessage("");
        }
    };

    const handleExistingUser = async () => {
        if(!inputId) return;

        try {
            const res = await fetch(`/api/Chat/getChat/${inputId}`);

            if(!res.ok) {
                setIdError("존재하지 않는 아이디입니다.");
                return;
            }

            const data = await res.json();

            const loadedMessages: ChatMessage[] = data.map((chat: any) => ({
                text: chat.message,
                isSent: chat.from === inputId,
                from: chat.from,
                to: chat.to
            }));

            setMessages(loadedMessages);
            setUserId(inputId);
            setMode('connected');
        } catch(err) {
            setIdError("존재하지 않는 아이디입니다.");
        }
    };

    if(mode === 'select') return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">Chat App</h1>
            <button onClick={() => { setMode('new'); connectWebSocket(); }}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg">신규 회원</button>
            <button onClick={() => setMode('existing')}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg">기존 회원</button>
        </div>
    );

    if(mode === 'new' && !userId) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <p className="text-gray-500">연결 중...</p>
        </div>
    );

    if(mode === 'existing') return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">아이디 입력</h1>
            <input
                style={{color: "#fff"}}
                type="text"
                value={inputId}
                onChange={(e) => { setInputId(e.target.value); setIdError(""); }}
                className="border px-4 py-2 rounded"
                placeholder="ID" />
            {idError && <p className="text-red-500 text-sm">{idError}</p>}
            <button
                onClick={handleExistingUser}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg">입력</button>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">Chat App</h1>
                {userId && (
                    <div className="bg-blue-600 px-3 py-1 rounded">
                        YourId: <span className="font-bold">{userId}</span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg 
                            ${msg.isSent ? 'bg-blue-500 text-white self-end' : 'bg-white text-gray-800 self-start'}`}>
                        <div className="font-bold">{msg.isSent ? 'You' : msg.from}</div>
                        <div>{msg.text}</div>
                        {msg.to && <div className="text-xs">{msg.isSent ? `To: ${msg.to}` : ''}</div>}
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t">
                <div className="flex mb-2">
                    <input
                        style={{color: "#000"}}
                        type="text"
                        value={recepientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Recipient Id (leave empty for broadcast)" />
                </div>
                <div className="flex">
                    <input
                        style={{color: "#000"}}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 border rounded-l px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message...." />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}