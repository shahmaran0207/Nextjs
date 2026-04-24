"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../app/Shopping/shopping.css";

interface Notification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const { email } = useAuthGuard();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  const fetchNotifications = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) fetchNotifications();
  }, [email]);

  const handleReadAll = async () => {
    const token = getToken();
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleClick = async (n: Notification) => {
    if (!n.is_read) {
      const token = getToken();
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
      );
    }
    if (n.link) router.push(n.link);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row-center gap-12">
          <div className="logo-icon">🔔</div>
          <div>
            <h1 className="header-title text-primary">알림 센터</h1>
            <p className="header-subtitle text-accent">
              {unreadCount > 0 ? `읽지 않은 알림 ${unreadCount}개` : "모든 알림을 확인했습니다"}
            </p>
          </div>
        </div>
        <nav className="flex-row gap-xs">
          <Link href="/mypage" className="nav-link">마이페이지</Link>
          <Link href="/Shopping" className="nav-link">쇼핑</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          <div className="flex-row-between mb-md">
            <div className="flex-row-center gap-xs">
              <span className="category-badge">알림</span>
              <h2 className="margin-0 text-primary text-18 text-bold">
                전체 알림 ({notifications.length})
              </h2>
            </div>
            {unreadCount > 0 && (
              <button onClick={handleReadAll} className="btn-outline-secondary btn-sm">
                전체 읽음 처리
              </button>
            )}
          </div>

          {loading && (
            <div className="loading-container h-200">
              <div className="spinner" />
              <span className="text-14">알림을 불러오는 중...</span>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="card-container shop-surface border-default text-center p-lg">
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔔</div>
              <p className="text-muted">아직 알림이 없습니다.</p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <div className="card-container shop-surface border-default" style={{ overflow: "hidden" }}>
              {notifications.map((n, idx) => (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`p-md ${idx < notifications.length - 1 ? "border-bottom-default" : ""}`}
                  style={{
                    cursor: n.link ? "pointer" : "default",
                    background: n.is_read ? "transparent" : "rgba(56,189,248,0.07)",
                    transition: "background 0.2s",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.is_read ? "transparent" : "rgba(56,189,248,0.07)"; }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: n.is_read ? "transparent" : "#38bdf8",
                      flexShrink: 0,
                      marginTop: "5px",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="flex-row-between">
                      <div className="text-14-bold text-primary mb-xs">{n.title}</div>
                      <div className="text-12 text-muted">
                        {new Date(n.created_at).toLocaleString("ko-KR")}
                      </div>
                    </div>
                    <div className="text-13 text-secondary">{n.message}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
