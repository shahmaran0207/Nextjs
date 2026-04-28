"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../Shopping/shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  option_name?: string | null;
  tracking_number?: string | null;
}

interface Order {
  id: number;
  order_number: string;
  order_status: string;
  final_amount: number;
  ordered_at: string;
  shipping_address?: string | null;
  items: OrderItem[];
}

interface CryptoOrder {
  id: number;
  order_id: string;
  status: string;
  amount: string | null;
  token_symbol: string | null;
  chain_name: string | null;
  payer: string | null;
  seller_wallet: string | null;
  tx_hash: string | null;
  paid_at: string | null;
  created_at: string;
  product_id: number | null;
  buyer_email: string | null;
}

export default function OrdersPage() {
  const { email } = useAuthGuard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cryptoOrders, setCryptoOrders] = useState<CryptoOrder[]>([]);
  const [cryptoReceived, setCryptoReceived] = useState<CryptoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"card" | "crypto-sent" | "crypto-received">("card");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // 반품 사유 모달 상태
  const [returnModal, setReturnModal] = useState<{ orderId: number } | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const RETURN_REASONS = [
    "생각보다 핏이 타이트함",
    "화면과 색상이 다름",
    "생각보다 얇은 소재",
    "배송 지연 / 파손",
    "주문 실수 (사이즈/색상)",
    "제품 불량",
    "기타",
  ];

  useEffect(() => {
    const fetchAll = async () => {
      if (!email) return;
      try {
        setLoading(true);

        // 일반 카드 주문 조회
        const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "주문내역을 불러오지 못했습니다.");
        setOrders(data.orders || []);

        // 암호화폐 결제 (구매 내역) 조회
        const cryptoRes = await fetch(`/api/crypto-orders?email=${encodeURIComponent(email)}`);
        const cryptoData = await cryptoRes.json();
        if (cryptoRes.ok) setCryptoOrders(cryptoData.orders || []);

        // 내 지갑 주소 조회 (판매자 수신 내역용)
        try {
          const walletRes = await fetch(`/api/wallet`);
          const walletData = await walletRes.json();
          if (walletRes.ok && walletData.address) {
            setWalletAddress(walletData.address);
            const receivedRes = await fetch(`/api/crypto-orders?sellerWallet=${encodeURIComponent(walletData.address)}`);
            const receivedData = await receivedRes.json();
            if (receivedRes.ok) setCryptoReceived(receivedData.orders || []);
          }
        } catch (_) { /* 지갑 미등록 시 무시 */ }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchAll();
  }, [email]);

  const fetchOrdersForUpdate = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) setOrders(data.orders || []);
    } catch (_) { }
  };

  const updateOrderStatus = async (orderId: number, action: "CANCEL" | "CONFIRM" | "RETURN_REQUEST", reason?: string) => {
    const actionText = action === "CANCEL" ? "주문을 취소" : action === "RETURN_REQUEST" ? "반품 요청" : "구매를 확정";
    if (!confirm(`정말 이 ${actionText}하시겠습니까?`)) return;
    try {
      let res;
      if (action === "CANCEL") {
        res = await fetch(`/api/orders/${orderId}/cancel`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } else {
        res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, email, return_reason: reason ?? null }),
        });
      }
      const data = await res.json();
      if (res.ok) { alert(`${actionText} 처리되었습니다.`); fetchOrdersForUpdate(); }
      else alert(data.error || "상태 변경에 실패했습니다.");
    } catch (_) { alert("오류가 발생했습니다."); }
  };

  // 암호화폐 주문 카드 렌더링
  const renderCryptoOrder = (order: CryptoOrder, direction: "sent" | "received") => (
    <div key={order.id} style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px", padding: "16px 20px", marginBottom: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span style={{
            fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "20px",
            background: order.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
            color: order.status === "paid" ? "#10b981" : "#a5b4fc",
            border: `1px solid ${order.status === "paid" ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.4)"}`,
          }}>
            {order.status === "paid" ? "✅ 결제 완료" : "⏳ 처리 중"}
          </span>
          <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>{order.order_id}</span>
        </div>
        <span style={{ fontSize: "12px", color: "#64748b" }}>
          {new Date(order.created_at).toLocaleString("ko-KR")}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
        <div>
          <div style={{ color: "#64748b", fontSize: "11px" }}>결제액</div>
          <div style={{ color: "#10b981", fontWeight: 700, marginTop: "2px" }}>
            {order.amount ?? "—"} {order.token_symbol ?? ""}
          </div>
        </div>
        <div>
          <div style={{ color: "#64748b", fontSize: "11px" }}>체인</div>
          <div style={{ color: "#e2e8f0", marginTop: "2px" }}>{order.chain_name ?? "—"}</div>
        </div>
        {direction === "received" && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ color: "#64748b", fontSize: "11px" }}>구매자</div>
            <div style={{ color: "#cbd5e1", fontFamily: "monospace", fontSize: "12px", marginTop: "2px", wordBreak: "break-all" }}>
              {order.payer ?? "—"}
              {order.buyer_email && <span style={{ color: "#64748b", marginLeft: "8px" }}>({order.buyer_email})</span>}
            </div>
          </div>
        )}
        {order.tx_hash && (
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ color: "#64748b", fontSize: "11px" }}>Tx Hash</div>
            <div style={{ color: "#6366f1", fontFamily: "monospace", fontSize: "11px", marginTop: "2px", wordBreak: "break-all" }}>
              {order.tx_hash}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="📦"
        title="주문내역"
        subtitle="결제 완료된 상품 목록입니다"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "쇼핑하러 가기" },
          { href: "/cart", label: "장바구니 가기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          {loading && (
            <div className="loading-container h-260">
              <div className="spinner" />
              <span className="text-14">주문내역을 불러오는 중...</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && (
            <>
              {/* ── 탭 ────────────────────────────────────────────── */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                {[
                  { key: "card",            label: `💳 카드 주문 (${orders.length})` },
                  { key: "crypto-sent",     label: `⛓️ 암호화폐 결제 (${cryptoOrders.length})` },
                  { key: "crypto-received", label: `💰 암호화폐 수신 (${cryptoReceived.length})` },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    style={{
                      padding: "8px 16px", borderRadius: "8px", border: "1px solid",
                      borderColor: activeTab === tab.key ? "#6366f1" : "rgba(255,255,255,0.1)",
                      background: activeTab === tab.key ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                      color: activeTab === tab.key ? "#fff" : "#64748b",
                      cursor: "pointer", fontSize: "13px", fontWeight: activeTab === tab.key ? 700 : 400,
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── 카드 주문 탭 ──────────────────────────────────── */}
              {activeTab === "card" && (
                <>
                  <div className="title-banner">
                    <div className="flex-row-center gap-12">
                      <span className="category-badge">내 주문내역</span>
                      <h2 className="margin-0 text-primary text-18 text-bold">총 {orders.length}건의 주문</h2>
                    </div>
                  </div>

                  {orders.length === 0 ? (
                    <div className="card-container empty-table-cell border-default">
                      <div className="empty-state-icon">📝</div>
                      <p>주문 내역이 없습니다.</p>
                      <Link href="/Shopping" className="nav-link empty-state-link">쇼핑하러 가기</Link>
                    </div>
                  ) : (
                    <div className="product-detail-layout">
                      {orders.map((order) => {
                        const firstItem = order.items[0];
                        const extraCount = order.items.length - 1;
                        const orderTitle = extraCount > 0
                          ? `${firstItem?.product_name}${firstItem?.option_name ? `(${firstItem.option_name})` : ''} 외 ${extraCount}건`
                          : (firstItem?.product_name
                            ? `${firstItem.product_name}${firstItem?.option_name ? `(${firstItem.option_name})` : ''}`
                            : "상품 없음");
                        const trackingNumber = order.items.find(item => !!item.tracking_number)?.tracking_number;

                        return (
                          <div key={order.id} className="card-container shop-surface border-default">
                            <div className="detail-table-header flex-justify-between">
                              <div className="flex-row-center gap-12">
                                <span className="text-13-mono text-muted">주문번호: {order.order_number}</span>
                                <span className="status-badge active">
                                  {{ PENDING: "결제 대기", PAID: "결제 완료", SHIPPED: "배송 중", DELIVERED: "배송 완료",
                                     CONFIRMED: "구매 확정", CANCELLED: "취소됨", RETURN_REQUEST: "반품 요청",
                                     RETURN_COMPLETED: "반품 완료" }[order.order_status] ?? order.order_status}
                                </span>
                              </div>
                              <span className="text-12 text-muted">{new Date(order.ordered_at).toLocaleString('ko-KR')}</span>
                            </div>
                            <div className="p-md flex-row-between">
                              <div className="flex-row gap-sm items-center">
                                <div className="img-placeholder bg-dim rounded-md" style={{ width: "60px", height: "60px" }}>📦</div>
                                <div>
                                  <div className="text-16-bold text-primary mb-1">{orderTitle}</div>
                                  <div className="text-14-money text-green">총 결제금액: ₩{Number(order.final_amount).toLocaleString()}</div>
                                  {(order as any).return_reason && (
                                    <div style={{ fontSize: "12px", color: "#f87171", marginTop: "4px" }}>↩ 반품 사유: {(order as any).return_reason}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex-row gap-xs">
                                {(order.order_status === "PAID" || order.order_status === "PENDING") && (
                                  <button onClick={() => updateOrderStatus(order.id, "CANCEL")}
                                    className="btn-outline-secondary btn-sm" style={{ padding: "8px 16px" }}>
                                    주문 취소
                                  </button>
                                )}
                                {order.order_status === "SHIPPED" && (
                                  <>
                                    <button onClick={() => updateOrderStatus(order.id, "CONFIRM")}
                                      className="btn-success btn-sm" style={{ padding: "8px 16px" }}>
                                      상품 수령 (구매 확정)
                                    </button>
                                    {trackingNumber && (
                                      <Link href={`/digitalTwin?tracking_number=${trackingNumber}&address=${encodeURIComponent(order.shipping_address || '')}`}
                                        className="btn-accent btn-sm"
                                        style={{ padding: "8px 16px", backgroundColor: "#8b5cf6", color: "white", border: "none" }}>
                                        🚚 배송 3D 뷰
                                      </Link>
                                    )}
                                  </>
                                )}
                                {order.order_status === "DELIVERED" && (
                                  <button onClick={() => { setReturnModal({ orderId: order.id }); setReturnReason(""); }}
                                    className="btn-sm"
                                    style={{ padding: "8px 16px", backgroundColor: "rgba(239,68,68,0.15)", color: "#ef4444",
                                             border: "1px solid #ef4444", borderRadius: "6px", cursor: "pointer" }}>
                                    반품 요청
                                  </button>
                                )}
                                <Link href={`/orders/${order.id}`} className="btn-outline-secondary btn-sm" style={{ padding: "8px 16px" }}>
                                  주문 상세 보기
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── 암호화폐 결제 (보낸 내역) 탭 ────────────────── */}
              {activeTab === "crypto-sent" && (
                <>
                  <div className="title-banner">
                    <h2 className="margin-0 text-primary text-18 text-bold">⛓️ 내 암호화폐 결제 내역 ({cryptoOrders.length}건)</h2>
                  </div>
                  {cryptoOrders.length === 0 ? (
                    <div className="card-container empty-table-cell border-default">
                      <div className="empty-state-icon">⛓️</div>
                      <p>암호화폐 결제 내역이 없습니다.</p>
                    </div>
                  ) : (
                    cryptoOrders.map(o => renderCryptoOrder(o, "sent"))
                  )}
                </>
              )}

              {/* ── 암호화폐 수신 (판매자) 탭 ───────────────────── */}
              {activeTab === "crypto-received" && (
                <>
                  <div className="title-banner">
                    <h2 className="margin-0 text-primary text-18 text-bold">💰 판매자 수신 내역 ({cryptoReceived.length}건)</h2>
                  </div>
                  {!walletAddress ? (
                    <div className="card-container empty-table-cell border-default">
                      <div className="empty-state-icon">🔑</div>
                      <p>지갑을 등록해야 수신 내역을 확인할 수 있습니다.</p>
                      <Link href="/mypage/crypto-wallet" className="nav-link empty-state-link">지갑 등록하기</Link>
                    </div>
                  ) : cryptoReceived.length === 0 ? (
                    <div className="card-container empty-table-cell border-default">
                      <div className="empty-state-icon">💰</div>
                      <p>수신된 암호화폐 결제가 없습니다.</p>
                    </div>
                  ) : (
                    cryptoReceived.map(o => renderCryptoOrder(o, "received"))
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      {/* ── 반품 사유 선택 모달 ───────────────────────────────── */}
      {returnModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{
            background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "16px", padding: "28px", width: "360px", maxWidth: "90vw",
          }}>
            <h3 style={{ margin: "0 0 16px", color: "#f1f5f9", fontSize: "16px" }}>↩ 반품 사유 선택</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
              {RETURN_REASONS.map((r) => (
                <label key={r} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                  <input
                    type="radio" name="returnReason" value={r}
                    checked={returnReason === r}
                    onChange={() => setReturnReason(r)}
                    style={{ accentColor: "#ef4444" }}
                  />
                  <span style={{ fontSize: "14px", color: "#cbd5e1" }}>{r}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setReturnModal(null)}
                style={{ padding: "8px 18px", borderRadius: "8px", background: "rgba(255,255,255,0.08)",
                         color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                취소
              </button>
              <button
                disabled={!returnReason}
                onClick={() => {
                  if (!returnReason) { alert("반품 사유를 선택해 주세요."); return; }
                  setReturnModal(null);
                  updateOrderStatus(returnModal.orderId, "RETURN_REQUEST", returnReason);
                }}
                style={{ padding: "8px 18px", borderRadius: "8px",
                         background: returnReason ? "#ef4444" : "rgba(239,68,68,0.3)",
                         color: "white", border: "none", cursor: returnReason ? "pointer" : "default" }}>
                반품 요청
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
