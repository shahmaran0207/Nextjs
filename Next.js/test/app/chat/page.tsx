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

    const dark = {
        bg: "#0a0e1a",
        surface: "#1a1d27",
        surface2: "#22263a",
        border: "rgba(56,189,248,0.15)",
        textPrimary: "#e8eaf0",
        textSecondary: "#8b90a7",
        textMuted: "#545874",
        accent: "#38bdf8",
        accentDim: "rgba(56,189,248,0.1)",
    };

    if(mode === 'roomList') return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
            {/* Digital Twin Header */}
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
                        💬
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            채팅방 목록
                        </h1>
                        <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                            실시간 웹소켓 채팅
                        </p>
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

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "2rem" }}>
                {chatRooms.length === 0 
                    ? <p style={{ color: dark.textMuted, fontSize: "15px" }}>채팅 내역이 없습니다.</p>
                    : chatRooms.map((roomId) => (
                        <button
                            key={roomId}
                            onClick={() => handleRoomSelect(roomId)}
                            style={{
                                background: dark.surface,
                                border: `1px solid ${dark.border}`,
                                width: "320px",
                                padding: "1rem 1.5rem",
                                borderRadius: "12px",
                                textAlign: "left",
                                color: dark.textPrimary,
                                fontSize: "15px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = dark.surface2;
                                (e.currentTarget as HTMLElement).style.borderColor = dark.accent;
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = dark.surface;
                                (e.currentTarget as HTMLElement).style.borderColor = dark.border;
                            }}
                        >
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
                    style={{
                        background: dark.accent,
                        color: "#0a0e1a",
                        width: "320px",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "12px",
                        marginTop: "1rem",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    ✏️ 새 채팅 시작
                </button>
            </div>
        </div>
    );

    if(mode === 'select') return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
            {/* Digital Twin Header */}
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
                        💬
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            웹소켓 채팅
                        </h1>
                        <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                            실시간 채팅 시작하기
                        </p>
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

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                <button 
                    onClick={() => { setMode('new'); connectWebSocket(); }}
                    style={{
                        background: dark.accent,
                        color: "#0a0e1a",
                        padding: "0.75rem 2rem",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    신규 회원
                </button>
                <button 
                    onClick={() => setMode('existing')}
                    style={{
                        background: dark.surface,
                        color: dark.textPrimary,
                        padding: "0.75rem 2rem",
                        borderRadius: "12px",
                        border: `1px solid ${dark.border}`,
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    기존 회원
                </button>
            </div>
        </div>
    );

    if(mode === 'new' && !userId) return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ color: dark.textMuted, fontSize: "15px" }}>연결 중...</p>
        </div>
    );

    if(mode === 'existing') return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
            {/* Digital Twin Header */}
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
                        💬
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            아이디 입력
                        </h1>
                        <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                            기존 회원 로그인
                        </p>
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

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                <input
                    type="text"
                    value={inputId}
                    onChange={(e) => { setInputId(e.target.value); setIdError(""); }}
                    style={{
                        border: `1px solid ${dark.border}`,
                        padding: "0.75rem 1rem",
                        borderRadius: "10px",
                        background: dark.surface2,
                        color: dark.textPrimary,
                        fontSize: "14px",
                        outline: "none",
                        width: "280px",
                    }}
                    placeholder="ID" 
                />
                {idError && <p style={{ color: "#f87171", fontSize: "13px" }}>{idError}</p>}
                <button
                    onClick={handleExistingUser}
                    style={{
                        background: dark.accent,
                        color: "#0a0e1a",
                        padding: "0.75rem 2rem",
                        borderRadius: "12px",
                        border: "none",
                        fontSize: "15px",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    입력
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: dark.bg }}>
            {/* Digital Twin Header */}
            <header style={{
                background: "rgba(10, 14, 26, 0.95)",
                borderBottom: `1px solid ${dark.border}`,
                padding: "0.75rem 1.5rem",
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
                        💬
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            웹소켓 채팅
                        </h1>
                        {userId && (
                            <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                                Your ID: {userId}
                            </p>
                        )}
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

            <div style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: "0.75rem",
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            maxWidth: "70%",
                            background: msg.isSent ? dark.accent : dark.surface,
                            color: msg.isSent ? "#0a0e1a" : dark.textPrimary,
                            marginLeft: msg.isSent ? "auto" : "0",
                            marginRight: msg.isSent ? "0" : "auto",
                        }}
                    >
                        <div style={{ fontWeight: 600, fontSize: "13px", marginBottom: "4px" }}>
                            {msg.isSent ? 'You' : msg.from}
                        </div>
                        <div style={{ fontSize: "14px" }}>{msg.text}</div>
                        {msg.imageUrl && (
                            <img
                                src={msg.imageUrl}
                                alt="첨부 이미지"
                                style={{ marginTop: "0.5rem", maxWidth: "280px", borderRadius: "8px" }}
                            />
                        )}
                        {msg.to && (
                            <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.7 }}>
                                {msg.isSent ? `To: ${msg.to}` : ''}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={sendMessage} style={{ padding: "1rem", background: dark.surface, borderTop: `1px solid ${dark.border}` }}>
                <div style={{ marginBottom: "0.75rem" }}>
                    <input
                        type="text"
                        value={recepientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        style={{
                            width: "100%",
                            border: `1px solid ${dark.border}`,
                            borderRadius: "10px",
                            padding: "0.75rem",
                            background: dark.surface2,
                            color: dark.textPrimary,
                            fontSize: "14px",
                            outline: "none",
                            boxSizing: "border-box",
                        }}
                        placeholder="Recipient Id (leave empty for broadcast)"
                        disabled={recipientLocked} 
                    />
                </div>
                
                <div style={{ marginBottom: "0.75rem" }}>
                    <label style={{
                        display: "block",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: dark.textMuted,
                        marginBottom: "6px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                    }}>
                        이미지
                    </label>
                    <label htmlFor="image" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "10px 14px",
                        border: `1.5px dashed ${dark.accent}`,
                        borderRadius: "10px",
                        background: dark.accentDim,
                        color: dark.accent,
                        fontSize: "13px",
                        cursor: "pointer",
                    }}>
                        📎 {image ? image.name : "이미지를 선택하세요"}
                    </label>
                    {image && (
                        <button
                            type="button"
                            onClick={() => setImage(null)}
                            style={{ 
                                marginTop: "6px", 
                                fontSize: "12px", 
                                color: "#f87171", 
                                cursor: "pointer", 
                                border: "none",
                                background: "transparent",
                            }}
                        >
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

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        style={{
                            flex: 1,
                            border: `1px solid ${dark.border}`,
                            borderRadius: "10px",
                            padding: "0.75rem",
                            background: dark.surface2,
                            color: dark.textPrimary,
                            fontSize: "14px",
                            outline: "none",
                        }}
                        placeholder="Type a message...." 
                    />
                    <button
                        disabled={recepientId === userId || (!message && !image)}
                        type="submit"
                        style={{
                            background: recepientId === userId || (!message && !image) ? dark.surface2 : dark.accent,
                            color: recepientId === userId || (!message && !image) ? dark.textMuted : "#0a0e1a",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "10px",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: recepientId === userId || (!message && !image) ? "not-allowed" : "pointer",
                        }}
                    >
                        보내기
                    </button>
                </div>
            </form>
        </div>
    );
}
