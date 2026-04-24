"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../Shopping/shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  order_status: string;
  final_amount: number;
  ordered_at: string;
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

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row-center gap-12">
          <div className="logo-icon">📦</div>
          <div>
            <h1 className="header-title text-primary">주문내역</h1>
            <p className="header-subtitle text-accent">결제 완료된 상품 목록입니다</p>
          </div>
        </div>
        <nav className="flex-row-center gap-2">
          <Link href="/Shopping" className="nav-link">쇼핑하러 가기</Link>
          <Link href="/cart" className="nav-link">장바구니</Link>
          <Link href="/" className="nav-link">홈으로</Link>
        </nav>
      </header>

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
                  <h2 className="margin-0 text-primary" style={{ fontSize: "18px", fontWeight: 700 }}>
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
                      ? `${firstItem?.product_name} 외 ${extraCount}건`
                      : firstItem?.product_name || "상품 없음";

                    return (
                      <div key={order.id} className="card-container shop-surface border-default">
                        <div className="detail-table-header flex-justify-between">
                          <div className="flex-row-center gap-12">
                            <span className="text-13-mono text-muted">주문번호: {order.order_number}</span>
                            <span className="status-badge active">
                              {order.order_status === "PAID" ? "결제완료" : 
                               order.order_status === "PENDING" ? "결제대기" : order.order_status}
                            </span>
                          </div>
                          <span className="text-12 text-muted">
                            {new Date(order.ordered_at).toLocaleString('ko-KR')}
                          </span>
                        </div>
                        <div style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <div className="img-placeholder bg-grid" style={{ width: "60px", height: "60px", borderRadius: "8px", background: "rgba(56,189,248,0.05)" }}>📦</div>
                            <div>
                              <div className="text-16-bold text-primary mb-1">{orderTitle}</div>
                              <div className="text-14-money text-green">총 결제금액: ₩{Number(order.final_amount).toLocaleString()}</div>
                            </div>
                          </div>
                          <Link href={`/orders/${order.id}`} className="btn-outline-secondary" style={{ padding: "8px 16px" }}>
                            주문 상세 보기
                          </Link>
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
