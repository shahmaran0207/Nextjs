"use client"

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
    text: string;
    isSent: boolean;
    from: string;
    to?: string;
    imageUrl?: string;
}

interface ChatUser {
    email: string;
    name: string | null;
}

// email: 로그인된 내 이메일 (useAuthGuard에서 전달)
export default function useChatState(email: string) {
    // roomList: 채팅방 목록, newChat: 새 상대 선택, connected: 채팅 중
    const [mode, setMode] = useState<'roomList' | 'newChat' | 'connected'>('roomList');

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [chatRooms, setChatRooms] = useState<string[]>([]);

    const [recepientId, setRecipientId] = useState("");
    const [message, setMessage] = useState("");

    const [recipientLocked, setRecipientLocked] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    // 내 userId는 항상 로그인 이메일
    const userId = email;

    const [image, setImage] = useState<File | null>(null);

    // 새 채팅 상대 선택용: users 테이블에서 나를 제외한 유저 목록
    const [userList, setUserList] = useState<ChatUser[]>([]);
    const [userListError, setUserListError] = useState("");

    // 페이지 진입 시 내 채팅방 목록 불러오기
    useEffect(() => {
        if (!email) return;

        const loadRooms = async () => {
            try {
                const res = await fetch(`/api/Chat/getChat/${encodeURIComponent(email)}`);
                if (!res.ok) return;

                const data = await res.json();

                // 나와 대화한 상대방 이메일 목록 (중복 제거)
                const rooms = [...new Set(data.map((chat: any) =>
                    chat.from === email ? chat.to : chat.from
                ))] as string[];

                setChatRooms(rooms);
            } catch (err) {
                console.error("채팅방 목록 로드 에러:", err);
            }
        };

        loadRooms();
    }, [email]);

    const connectWebSocket = async () => {
        await fetch('/api/Chat/ws');

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = window.location.hostname;
        const ws = new WebSocket(`${protocol}://${host}:3001`);

        ws.onopen = () => {
            console.log("WebSocket Connection established");
            // 서버에 내 이메일(userId)을 등록
            ws.send(JSON.stringify({ type: 'register', userId: email }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "id") {
                setMode('connected');
            } else if (data.type === 'private' || data.type === 'broadcast') {
                setMessages((prev) => [
                    ...prev,
                    { text: data.message, isSent: false, from: data.from, imageUrl: data.imageUrl }
                ]);
                if (data.type === 'private') {
                    setRecipientId(data.from);
                    setRecipientLocked(true);
                };
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

    // 기존 채팅방 선택
    const handleRoomSelect = async (targetId: string) => {
        const res = await fetch(`/api/Chat/getChat/${encodeURIComponent(email)}`);
        const data = await res.json();

        const loadedMessages: ChatMessage[] = data
            .filter((chat: any) =>
                (chat.from === email && chat.to === targetId) ||
                (chat.from === targetId && chat.to === email))
            .map((chat: any) => ({
                text: chat.message,
                isSent: chat.from === email,
                from: chat.from,
                to: chat.to,
                imageUrl: chat.imageUrl
            }));

        setMessages(loadedMessages);
        setRecipientId(targetId);
        setRecipientLocked(true);
        await connectWebSocket();
        setMode('connected');
    };

    // 새 채팅 시작: users 테이블에서 나를 제외한 유저 목록 불러오기
    const handleNewChat = async () => {
        setUserListError("");
        try {
            const res = await fetch(`/api/Chat/getUsers?excludeEmail=${encodeURIComponent(email)}`);
            if (!res.ok) {
                setUserListError("유저 목록을 불러올 수 없습니다.");
                return;
            }
            const data: ChatUser[] = await res.json();
            if (data.length === 0) {
                setUserListError("채팅 가능한 다른 유저가 없습니다.");
                return;
            }
            setUserList(data);
            setMode('newChat');
        } catch (err) {
            setUserListError("유저 목록을 불러올 수 없습니다.");
        }
    };

    // 새 채팅 상대 선택
    const handleSelectNewRecipient = async (targetEmail: string) => {
        setMessages([]);
        setRecipientId(targetEmail);
        setRecipientLocked(true);
        await connectWebSocket();
        setMode('connected');

        // 혹시 기존 채팅방 목록에 없으면 추가
        setChatRooms((prev) =>
            prev.includes(targetEmail) ? prev : [...prev, targetEmail]
        );
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        let imageUrl: string | undefined;

        try {
            const formData = new FormData();
            formData.append("recepientId", recepientId);
            formData.append("userId", userId || "");
            formData.append("message", message);

            if (image) formData.append("image", image);

            const res = await fetch("/api/Chat/addChat", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            imageUrl = data.imageUrl;

            setImage(null);

        } catch (err: any) {
            console.error("채팅 기록 저장 에러:::::::::", err);
        }

        if ((message || imageUrl) && socketRef.current && userId) {
            if (recepientId) setRecipientLocked(true);

            const messageData = recepientId ?
                { type: 'private', from: userId, to: recepientId, message, imageUrl } :
                { type: 'broadcast', from: userId, message, imageUrl };

            socketRef.current.send(JSON.stringify(messageData));
            setMessages((prevMessages) => [...prevMessages, {
                text: message,
                isSent: true,
                from: userId,
                to: recepientId || 'all',
                imageUrl,
            }]);
            setMessage("");
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setImage(e.target.files[0]);
        };
    };

    return {
        mode, setMode,
        messages, setMessages,
        recepientId, setRecipientId,
        recipientLocked, setRecipientLocked,
        socketRef,
        userId,
        handleRoomSelect,
        handleNewChat,
        handleSelectNewRecipient,
        connectWebSocket,
        sendMessage,
        message, setMessage,
        image, setImage,
        handleImageChange,
        chatRooms, setChatRooms,
        userList,
        userListError,
    };
};