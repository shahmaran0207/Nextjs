"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // 읽지 않은 개수 폴링 (5초)
  useEffect(() => {
    const fetchCount = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/notifications/unread-count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count ?? 0);
        }
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 5000);
    return () => clearInterval(interval);
  }, []);

  // 드롭다운 열 때 알림 목록 불러오기
  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open) {
      setLoadingList(true);
      const token = getToken();
      try {
        const res = await fetch("/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } finally {
        setLoadingList(false);
      }
    }
  };

  // 개별 알림 클릭
  const handleNotificationClick = async (n: Notification) => {
    const token = getToken();
    if (!n.is_read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      setCount((c) => Math.max(0, c - 1));
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
    }
    setOpen(false);
    if (n.link) router.push(n.link);
  };

  // 전체 읽음
  const handleReadAll = async () => {
    const token = getToken();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={handleOpen}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "20px",
          position: "relative",
          padding: "4px 8px",
          color: "#e8eaf0",
          lineHeight: 1,
        }}
        title="알림"
      >
        🔔
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "10px",
              fontWeight: 700,
              minWidth: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
              lineHeight: 1,
            }}
          >
            {count > 99 ? "99+" : count}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: "320px",
            background: "#1a1d27",
            border: "1px solid rgba(56,189,248,0.2)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 999,
            overflow: "hidden",
          }}
        >
          {/* 헤더 */}
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid rgba(56,189,248,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#e8eaf0", fontWeight: 700, fontSize: "14px" }}>
              알림 {count > 0 && <span style={{ color: "#38bdf8" }}>({count})</span>}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {count > 0 && (
                <button
                  onClick={handleReadAll}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#38bdf8",
                    fontSize: "12px",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  전체 읽음
                </button>
              )}
              <button
                onClick={() => { setOpen(false); router.push("/notifications"); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8b90a7",
                  fontSize: "12px",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                전체 보기
              </button>
            </div>
          </div>

          {/* 목록 */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {loadingList ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#8b90a7", fontSize: "13px" }}>
                불러오는 중...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#8b90a7", fontSize: "13px" }}>
                알림이 없습니다
              </div>
            ) : (
              notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    cursor: n.link ? "pointer" : "default",
                    background: n.is_read ? "transparent" : "rgba(56,189,248,0.07)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.is_read ? "transparent" : "rgba(56,189,248,0.07)"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#e8eaf0", marginBottom: "3px" }}>
                        {!n.is_read && <span style={{ display: "inline-block", width: "6px", height: "6px", background: "#38bdf8", borderRadius: "50%", marginRight: "6px", verticalAlign: "middle" }} />}
                        {n.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#8b90a7", lineHeight: 1.4 }}>{n.message}</div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#545874", flexShrink: 0 }}>
                      {new Date(n.created_at).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
