'use client'

import { useEffect } from "react"
import useChatState from "../hook/useChatState";

export default function ChatPage() {
    
    const { mode, setMode, messages, setMessages, recepientId, setRecipientId,
            recipientLocked, setRecipientLocked, socketRef, userId, setMessage,
            handleRoomSelect, connectWebSocket, sendMessage, message, chatRooms,
            image, setImage, handleImageChange, handleExistingUser, idError, setIdError,
            inputId, setInputId
     } = useChatState();

    useEffect(() => {
        return () => {
            if(socketRef.current) socketRef.current.close();
        };
    }, []);

    if(mode === 'roomList') return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-2xl font-bold">채팅방 목록</h1>
            {chatRooms.length === 0 
                ? <p className="text-gray-500">채팅 내역이 없습니다.</p>
                : chatRooms.map((roomId) => (
                    <button
                        key={roomId}
                        onClick={() => handleRoomSelect(roomId)}
                        style={{color: "#000"}}
                        className="bg-white border w-64 px-6 py-3 rounded-lg text-left hover:bg-gray-50">
                        💬 {roomId}
                    </button>
                ))
            }
            <button
                onClick={async () => {
                    setRecipientLocked(false);
                    setRecipientId("");
                    setMessages([]);
                    await connectWebSocket();
                    setMode('connected');
                }}
                className="bg-blue-500 text-black-w-64 px-6 py-3 rounded-lg mt-2">
                    ✏️ 새 채팅 시작
                </button>
        </div>
    );

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
                style={{color: "#000"}}
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
                        {msg.imageUrl && (
                            <img
                                src={msg.imageUrl}
                                alt="첨부 이미지"
                                className="mt-2 max-w-xs rounded-lg"/>
                        )}
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
                        placeholder="Recipient Id (leave empty for broadcast)"
                        disabled={recipientLocked} />
                </div>
                
                <div style={{ marginBottom: "2rem" }}>
                    <label style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#868e96",
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}>
                    이미지
                    </label>
                    <label htmlFor="image" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        border: "1.5px dashed #74c0fc",
                        borderRadius: "10px",
                        background: "#f0f8ff",
                        color: "#4dabf7",
                        fontSize: "14px",
                        cursor: "pointer",
                    }}>
                    📎 {image ? image.name : "이미지를 선택하세요"}
                    </label>
                    {image && (
                        <button
                            type="button"
                            onClick={() => setImage(null)}
                            style={{ marginTop: "6px", fontSize: "12px", color: "#fa5252", cursor: "point", border: "none"}}>
                                ❌ 취소
                            </button>
                    )}
                    <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                    />
                </div>

                <div className="flex">
                    <input
                        style={{color: "#000"}}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-1 border rounded-l px-4 py-2 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message...." />
                    <button
                        disabled={ recepientId === userId || (!message && !image)}
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-r 
                            hover:bg-blue-600 focus:outline-none focus:ring-2 
                            focus:ring-blue-500
                            disabled:bg-gray-300 disabled:cursor-not-allowed">
                        보내기
                    </button>
                </div>
            </form>
        </div>
    );
}