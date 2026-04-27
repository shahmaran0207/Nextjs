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

export default function OrdersPage() {
  const { email } = useAuthGuard();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!email) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "주문내역을 불러오지 못했습니다.");
        setOrders(data.orders || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (email) fetchOrders();
  }, [email]);

  const fetchOrdersForUpdate = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (e) { }
  };

  const updateOrderStatus = async (orderId: number, action: "CANCEL" | "CONFIRM" | "RETURN_REQUEST") => {
    const actionText = action === "CANCEL" ? "주문을 취소" : action === "RETURN_REQUEST" ? "반품 요청" : "구매를 확정";
    if (!confirm(`정말 이 ${actionText}하시겠습니까?`)) return;

    try {
      let res;
      if (action === "CANCEL") {
        res = await fetch(`/api/orders/${orderId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      } else {
        res = await fetch(`/api/orders/${orderId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, email })
        });
      }
      const data = await res.json();

      if (res.ok) {
        alert(`${actionText} 처리되었습니다.`);
        fetchOrdersForUpdate();
      } else {
        alert(data.error || "상태 변경에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

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
              <div className="title-banner">
                <div className="flex-row-center gap-12">
                  <span className="category-badge">내 주문내역</span>
                  <h2 className="margin-0 text-primary text-18 text-bold">
                    총 {orders.length}건의 주문
                  </h2>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="card-container empty-table-cell border-default">
                  <div className="empty-state-icon">📝</div>
                  <p>주문 내역이 없습니다.</p>
                  <Link href="/Shopping" className="nav-link empty-state-link">
                    쇼핑하러 가기
                  </Link>
                </div>
              ) : (
                <div className="product-detail-layout">
                  {orders.map((order) => {
                    const firstItem = order.items[0];
                    const extraCount = order.items.length - 1;
                    const orderTitle = extraCount > 0
                      ? `${firstItem?.product_name}${firstItem?.option_name ? `(${firstItem.option_name})` : ''} 외 ${extraCount}건`
                      : (firstItem?.product_name ? `${firstItem.product_name}${firstItem?.option_name ? `(${firstItem.option_name})` : ''}` : "상품 없음");

                    const trackingNumber = order.items.find(item => !!item.tracking_number)?.tracking_number;

                    return (
                      <div key={order.id} className="card-container shop-surface border-default">
                        <div className="detail-table-header flex-justify-between">
                          <div className="flex-row-center gap-12">
                            <span className="text-13-mono text-muted">주문번호: {order.order_number}</span>
                            <span className="status-badge active">
                              {{
                                PENDING: "결제 대기",
                                PAID: "결제 완료",
                                SHIPPED: "배송 중",
                                DELIVERED: "배송 완료",
                                CONFIRMED: "구매 확정",
                                CANCELLED: "취소됨",
                                RETURN_REQUEST: "반품 요청",
                                RETURN_COMPLETED: "반품 완료",
                              }[order.order_status] ?? order.order_status}
                            </span>
                          </div>
                          <span className="text-12 text-muted">
                            {new Date(order.ordered_at).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <div className="p-md flex-row-between">
                          <div className="flex-row gap-sm items-center">
                            <div className="img-placeholder bg-dim rounded-md" style={{ width: "60px", height: "60px" }}>📦</div>
                            <div>
                              <div className="text-16-bold text-primary mb-1">{orderTitle}</div>
                              <div className="text-14-money text-green">총 결제금액: ₩{Number(order.final_amount).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex-row gap-xs">
                            {(order.order_status === "PAID" || order.order_status === "PENDING") && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "CANCEL")}
                                className="btn-outline-secondary btn-sm"
                                style={{ padding: "8px 16px" }}
                              >
                                주문 취소
                              </button>
                            )}
                            {order.order_status === "SHIPPED" && (
                              <>
                                <button
                                  onClick={() => updateOrderStatus(order.id, "CONFIRM")}
                                  className="btn-success btn-sm"
                                  style={{ padding: "8px 16px" }}
                                >
                                  상품 수령 (구매 확정)
                                </button>
                                {trackingNumber && (
                                  <Link 
                                    href={`/digitalTwin?tracking_number=${trackingNumber}&address=${encodeURIComponent(order.shipping_address || '')}`} 
                                    className="btn-accent btn-sm" 
                                    style={{ padding: "8px 16px", backgroundColor: "#8b5cf6", color: "white", border: "none" }}
                                  >
                                    🚚 배송 3D 뷰
                                  </Link>
                                )}
                              </>
                            )}
                            {order.order_status === "DELIVERED" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "RETURN_REQUEST")}
                                className="btn-sm"
                                style={{ padding: "8px 16px", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "1px solid #ef4444", borderRadius: "6px", cursor: "pointer" }}
                              >
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
        </div>
      </main>
    </div>
  );
}
