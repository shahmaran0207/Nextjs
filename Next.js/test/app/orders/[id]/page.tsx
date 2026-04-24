"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../../Shopping/shopping.css";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
}

interface OrderDetail {
  id: number;
  order_number: string;
  order_status: string;
  final_amount: number;
  ordered_at: string;
  receiver_name: string | null;
  receiver_phone: string | null;
  shipping_address: string | null;
  shipping_message: string | null;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { email } = useAuthGuard();
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!email || !id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${id}?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "주문 상세 내역을 불러오지 못했습니다.");
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (email && id) fetchOrderDetail();
  }, [email, id]);

  if (loading) {
    return (
      <div className="page-container shop-bg">
        <div className="loading-container h-260">
          <div className="spinner" />
          <span className="text-14">주문 정보를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-container shop-bg">
        <div className="error-container">⚠️ {error || "주문 정보를 찾을 수 없습니다."}</div>
      </div>
    );
  }

  const statusText = order.order_status === "PAID" ? "결제완료" : 
                     order.order_status === "PENDING" ? "결제대기" : order.order_status;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row-center gap-12">
          <div className="logo-icon">📦</div>
          <div>
            <h1 className="header-title text-primary">주문 상세</h1>
            <p className="header-subtitle text-accent">{new Date(order.ordered_at).toLocaleString('ko-KR')}</p>
          </div>
        </div>
        <nav className="flex-row-center gap-2">
          <Link href="/orders" className="nav-link">주문 내역으로</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900" style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
          
          {/* 상단 주문 요약 */}
          <div className="card-container shop-surface border-default flex-justify-between" style={{ padding: "1.5rem" }}>
            <div>
              <div className="text-13-mono text-muted mb-1">주문번호</div>
              <div className="text-18-bold text-primary">{order.order_number}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="text-13-mono text-muted mb-1">현재 상태</div>
              <span className="status-badge active" style={{ fontSize: "16px", padding: "6px 16px" }}>{statusText}</span>
            </div>
          </div>

          {/* 주문 상품 목록 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary" style={{ fontSize: "16px" }}>주문 상품 ({order.items.length}개)</h2>
            </div>
            <table className="shopping-table">
              <thead>
                <tr>
                  <th className="shopping-th">상품명</th>
                  <th className="shopping-th text-center">수량</th>
                  <th className="shopping-th text-right">결제금액</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={item.id} className={`product-row ${idx % 2 === 0 ? "td-cell-even" : "td-cell-odd"}`}>
                    <td className="td-cell text-14-bold text-primary">{item.product_name}</td>
                    <td className="td-cell text-center"><span className="text-14 font-mono text-primary">{item.quantity}</span></td>
                    <td className="td-cell text-right">
                      <div className="text-14-money text-green">₩{Number(item.total_price).toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="order-summary-footer">
              <span className="text-12 text-muted uppercase">총 결제금액</span>
              <span className="text-20-money text-green" style={{ marginLeft: "8px" }}>₩{Number(order.final_amount).toLocaleString()}</span>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary" style={{ fontSize: "16px" }}>배송 정보</h2>
            </div>
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">수령인</div>
                <div className="text-14 text-primary">{order.receiver_name || "-"}</div>
              </div>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">연락처</div>
                <div className="text-14 text-primary">{order.receiver_phone || "-"}</div>
              </div>
              <div style={{ display: "flex" }}>
                <div className="text-13 text-muted w-200 flex-none" style={{ marginTop: "4px" }}>배송지 주소</div>
                <div className="text-14 text-primary break-all" style={{ lineHeight: "1.5" }}>{order.shipping_address || "-"}</div>
              </div>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">배송 요청사항</div>
                <div className="text-14 text-primary">{order.shipping_message || "-"}</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
