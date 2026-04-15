"use client"

import { useRef, useState } from "react";

interface ChatMessage {
  text: string;
  isSent: boolean;
  from: string;
  to?: string;
  imageUrl?: string;
}

export default function useChatState() {
    const [ mode, setMode ] = useState<'select' | 'new' | 'existing' | 'connected' | 'roomList'>('select');

    const [ messages, setMessages ] = useState<ChatMessage[]>([]);
    const [ chatRooms, setChatRooms ] = useState<string[]>([]);
    
    const [ recepientId, setRecipientId ] = useState("");
    const [ message, setMessage ] = useState("");
    const [ inputId, setInputId ] = useState("");
    const [ idError, setIdError ] = useState("");

    const [ recipientLocked, setRecipientLocked ] = useState(false);

    const socketRef = useRef<WebSocket | null>(null);

    const [ userId, setUserId ] = useState<string | null>(null);
    const [ image, setImage ] = useState<File | null>(null);

    // const connectWebSocket = async () => {
    //     await fetch('/api/Chat/ws');
    //     const ws = new WebSocket(`wss://${window.location.host}/ws`);

    //     ws.onopen = () => { console.log("WebSocket Connection established"); };
    //         ws.onmessage = (event) => {
    //         const data = JSON.parse(event.data);

    //         if (data.type === "id") {
    //             setUserId(data.id);
    //             setMode('connected');
    //         } else if (data.type === 'private' || data.type === 'broadcast') {
    //             setMessages((prev) => [
    //                 ...prev,
    //                 { text: data.message, isSent: false, from: data.from, imageUrl: data.imageUrl }
    //             ]);
    //             if(data.type === 'private') {
    //                 setRecipientId(data.from);
    //                 setRecipientLocked(true);
    //             };
    //         }
    //     };

    //     ws.onerror = (error) => {
    //         console.error('WebSocket error:', error);
    //     };

    //     ws.onclose = () => {
    //         console.log("WebSocket connection closed");
    //     };

    //     socketRef.current = ws;
    // };

    const connectWebSocket = async () => {
        await fetch('/api/Chat/ws');
        
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
                    { text: data.message, isSent: false, from: data.from, imageUrl: data.imageUrl }
                ]);
                if(data.type === 'private') {
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

    const handleRoomSelect = async (targetId: string) => {
        const res = await fetch(`/api/Chat/getChat/${userId}`);
        const data = await res.json();
        
        const loadedMessages: ChatMessage[] = data
            .filter((chat: any) => 
                (chat.from === userId && chat.to === targetId) ||
                (chat.from === targetId && chat.to === userId))
            .map((chat: any) => ({
                text: chat.message,
                isSent: chat.from === userId,
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

            console.log("addChat 응답:", data);

            imageUrl = data.imageUrl;

            setImage(null);

        } catch(err: any) {
            console.log("채팅 기록 저장 에러:::::::::", err);
        }

        if((message || imageUrl) && socketRef.current && userId) {
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

    const handleImageChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]){
            setImage(e.target.files[0]);
        };
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

            const rooms = [...new Set(data.map((chat: any) => 
                chat.from === inputId ? chat.to : chat.from
            ))] as string[];

            setUserId(inputId);
            setChatRooms(rooms);
            setMode('roomList');

            setUserId(inputId);
        } catch(err) {
            setIdError("존재하지 않는 아이디입니다.");
        }
    };

    return {
        mode, setMode, messages, setMessages, recepientId, setRecipientId,
        recipientLocked, setRecipientLocked, socketRef, userId, setUserId,
        handleRoomSelect, connectWebSocket, sendMessage, message, setMessage,
        image, setImage, handleImageChange, handleExistingUser, idError, setIdError,
        inputId, setInputId, chatRooms, setChatRooms
    };
};