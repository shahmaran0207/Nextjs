'use client'

import { useEffect } from "react"
import useChatState from "../hook/useChatState";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import postStyle from "../hook/postStyle";
import { LogoutButton } from "@/component/LogoutButton";

export default function ChatPage() {
    const { email } = useAuthGuard();
    const { dark } = postStyle();

    const {
        mode, setMode, messages, recepientId, setRecipientId,
        recipientLocked, socketRef, userId, setMessage,
        handleRoomSelect, sendMessage, message, handleImageChange,
        chatRooms, image, setImage, handleSelectNewRecipient,
        handleNewChat, userList, userListError,
    } = useChatState(email);

    useEffect(() => {
        return () => {
            if (socketRef.current) socketRef.current.close();
        };
    }, []);

    // 공통 헤더 컴포넌트
    const Header = ({ title, subtitle }: { title: string; subtitle: string }) => (
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
                        {title}
                    </h1>
                    <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                        {subtitle}
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
                <LogoutButton />
            </nav>
        </header>
    );

    // 채팅방 목록 화면
    if (mode === 'roomList') return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
            <Header title="채팅방 목록" subtitle={`내 아이디: ${userId || '로딩 중...'}`} />

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
                                width: "360px",
                                padding: "1rem 1.5rem",
                                borderRadius: "12px",
                                textAlign: "left",
                                color: dark.textPrimary,
                                fontSize: "14px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                wordBreak: "break-all",
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
                    onClick={handleNewChat}
                    style={{
                        background: dark.accent,
                        color: "#0a0e1a",
                        width: "360px",
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

    // 새 채팅 상대 선택 화면 (users 테이블에서 나를 제외한 목록)
    if (mode === 'newChat') return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
            <Header title="새 채팅 시작" subtitle="대화할 상대를 선택하세요" />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "2rem" }}>
                <button
                    onClick={() => setMode('roomList')}
                    style={{
                        background: "transparent",
                        border: `1px solid ${dark.border}`,
                        color: dark.textSecondary,
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        fontSize: "13px",
                        cursor: "pointer",
                        marginBottom: "0.5rem",
                    }}
                >
                    ← 뒤로가기
                </button>

                {userListError && (
                    <p style={{ color: "#f87171", fontSize: "14px" }}>{userListError}</p>
                )}

                {userList.map((user) => (
                    <button
                        key={user.email}
                        onClick={() => handleSelectNewRecipient(user.email)}
                        style={{
                            background: dark.surface,
                            border: `1px solid ${dark.border}`,
                            width: "360px",
                            padding: "1rem 1.5rem",
                            borderRadius: "12px",
                            textAlign: "left",
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
                        <div style={{ fontWeight: 600, fontSize: "14px", color: dark.textPrimary }}>
                            👤 {user.name || "이름 없음"}
                        </div>
                        <div style={{ fontSize: "12px", color: dark.textSecondary, marginTop: "4px", wordBreak: "break-all" }}>
                            {user.email}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );

    // 채팅 화면
    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: dark.bg }}>
            <Header
                title="웹소켓 채팅"
                subtitle={userId ? `내 아이디: ${userId}` : "연결 중..."}
            />

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
