"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../../Shopping/shopping.css";

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  option_name?: string | null;
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
  const router = useRouter();
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

  const updateOrderStatus = async (action: "CANCEL" | "CONFIRM") => {
    const actionText = action === "CANCEL" ? "주문을 취소" : "구매를 확정";
    if (!confirm(`정말 이 ${actionText}하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, email })
      });
      const data = await res.json();
      
      if (res.ok) {
        alert(`${actionText} 처리되었습니다.`);
        setOrder(data.order);
      } else {
        alert(data.error || "상태 변경에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

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
        <div className="content-wrapper max-w-900 flex-col gap-lg">
          
          {/* 상단 주문 요약 */}
          <div className="card-container shop-surface border-default p-md flex-col gap-md">
            <div className="flex-justify-between">
              <div>
                <div className="text-13-mono text-muted mb-1">주문번호</div>
                <div className="text-18-bold text-primary">{order.order_number}</div>
              </div>
              <div className="text-right">
                <div className="text-13-mono text-muted mb-1">현재 상태</div>
                <span className="status-badge active p-sm text-16">{statusText}</span>
              </div>
            </div>
            
            {/* 상태 변경 액션 버튼 */}
            <div className="flex-justify-end gap-xs border-top-default pt-md mt-sm">
              {(order.order_status === "PAID" || order.order_status === "PENDING") && (
                <button 
                  onClick={() => updateOrderStatus("CANCEL")} 
                  className="btn-outline-secondary"
                >
                  주문 취소
                </button>
              )}
              {order.order_status === "SHIPPED" && (
                <button 
                  onClick={() => updateOrderStatus("CONFIRM")} 
                  className="btn-success"
                >
                  상품 수령 (구매 확정)
                </button>
              )}
            </div>
          </div>

          {/* 주문 상품 목록 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary text-16">주문 상품 ({order.items.length}개)</h2>
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
                  <tr 
                    key={item.id} 
                    className={`product-row ${idx % 2 === 0 ? "td-cell-even" : "td-cell-odd"} cursor-pointer`}
                    onClick={() => router.push(`/Shopping/${item.product_id}`)}
                  >
                    <td className="td-cell text-14-bold text-primary">
                      {item.product_name}
                      {item.option_name && <span className="text-13 text-accent ml-xs">({item.option_name})</span>}
                    </td>
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
              <span className="text-20-money text-green flex-row gap-xs">₩{Number(order.final_amount).toLocaleString()}</span>
            </div>
          </div>

          {/* 배송지 정보 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary text-16">배송 정보</h2>
            </div>
            <div className="p-md flex-col gap-sm">
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">수령인</div>
                <div className="text-14 text-primary">{order.receiver_name || "-"}</div>
              </div>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">연락처</div>
                <div className="text-14 text-primary">{order.receiver_phone || "-"}</div>
              </div>
              <div className="flex-row items-start">
                <div className="text-13 text-muted w-200 flex-none mt-2px">배송지 주소</div>
                <div className="text-14 text-primary break-all line-height-15">{order.shipping_address || "-"}</div>
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
