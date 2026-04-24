"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../../Shopping/shopping.css";

interface SellerOrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  tracking_number: string | null;
  item_status: string;
  created_at: string;
  order_info: {
    receiver_name: string;
    receiver_phone: string;
    shipping_address: string;
    shipping_message: string;
  };
}

export default function SellerOrdersPage() {
  const { role } = useAuthGuard();
  const router = useRouter();

  const [items, setItems] = useState<SellerOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 로컬 인풋 상태 (order_item_id -> 입력된 송장번호)
  const [trackingInputs, setTrackingInputs] = useState<Record<number, string>>({});

  const fetchOrders = async () => {
    if (!role) return;
    try {
      setLoading(true);
      const res = await fetch("/api/seller/orders");
      if (!res.ok) throw new Error("주문 내역을 불러오지 못했습니다.");
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && role !== "SELLER") {
      alert("판매자만 접근할 수 있는 페이지입니다.");
      router.push("/mypage");
      return;
    }
    fetchOrders();
  }, [role, router]);

  const handleTrackingSubmit = async (orderItemId: number) => {
    const tracking_number = trackingInputs[orderItemId];
    if (!tracking_number || tracking_number.trim() === "") {
      alert("운송장 번호를 입력해주세요.");
      return;
    }

    try {
      const res = await fetch("/api/seller/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_item_id: orderItemId, tracking_number })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "상태 업데이트 실패");
      }

      alert("운송장 번호가 등록되어 배송중 처리되었습니다.");
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === orderItemId 
          ? { ...item, tracking_number, item_status: "SHIPPING" } 
          : item
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReturnApprove = async (orderItemId: number) => {
    if (!confirm("반품을 승인하고 환불 처리를 진행하시겠습니까? (재고가 복구됩니다)")) return;
    try {
      const res = await fetch("/api/seller/orders/return", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_item_id: orderItemId })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "반품 승인 실패");
      }
      alert("반품 승인 및 환불이 완료되었습니다.");
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (role && role !== "SELLER") return null;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row gap-sm">
          <div className="logo-icon">🚚</div>
          <div>
            <h1 className="header-title text-primary">주문/배송 관리</h1>
            <p className="header-subtitle text-accent">판매된 상품의 배송 상태 업데이트</p>
          </div>
        </div>
        <nav className="flex-row gap-xs">
          <Link href="/mypage" className="nav-link">마이페이지</Link>
          <Link href="/myproducts" className="nav-link">나의 등록 상품</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-1100">
          
          <div className="title-banner shop-surface border-default border-left-accent mb-1rem">
            <div>
              <div className="flex-row-center gap-8 mb-6px">
                <span className="category-badge badge-accent">Seller Dashboard</span>
              </div>
              <h2 className="title-banner-heading text-primary margin-0">주문 접수 내역</h2>
              <p className="text-13 text-secondary mt-3px margin-0">고객이 결제한 내 상품 목록입니다. 운송장 번호를 입력하세요.</p>
            </div>
            {!loading && !error && (
              <div className="title-banner-stats badge-accent-dim">
                <div className="text-22-bold text-accent font-mono">{items.length}</div>
                <div className="text-11 text-muted mt-2px">총 접수 건</div>
              </div>
            )}
          </div>

          {loading && (
            <div className="loading-container h-200 text-secondary">
              <div className="spinner" />
              <span className="text-14">불러오는 중...</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && (
            <div className="card-container shop-surface border-default">
              <table className="shopping-table">
                <thead>
                  <tr className="border-bottom-default">
                    <th className="shopping-th">상품명</th>
                    <th className="shopping-th">수량/금액</th>
                    <th className="shopping-th">주문자/배송지</th>
                    <th className="shopping-th text-center">상태</th>
                    <th className="shopping-th">운송장 등록</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={5} className="empty-table-cell text-muted">주문 접수 내역이 없습니다.</td></tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id} className={`product-row border-bottom-default ${idx % 2 === 0 ? 'td-cell-even' : 'td-cell-odd'}`}>
                        <td className="td-cell">
                          <div className="text-14-bold text-primary">{item.product_name}</div>
                          <div className="text-11 text-muted mt-4px">주문일: {new Date(item.created_at).toLocaleString()}</div>
                        </td>
                        <td className="td-cell">
                          <div className="text-13 text-secondary">{Number(item.quantity)}개</div>
                          <div className="text-14-money text-accent">₩{Number(item.total_price).toLocaleString()}</div>
                        </td>
                        <td className="td-cell max-w-250">
                          <div className="text-13 text-primary">{item.order_info?.receiver_name} ({item.order_info?.receiver_phone})</div>
                          <div className="text-12 text-secondary mt-2px word-keep">{item.order_info?.shipping_address}</div>
                          {item.order_info?.shipping_message && (
                            <div className="text-11 text-muted mt-2px">메모: {item.order_info.shipping_message}</div>
                          )}
                        </td>
                        <td className="td-cell text-center">
                          {item.item_status === 'SHIPPING' ? (
                            <span className="category-badge badge-accent badge-sm">배송중</span>
                          ) : item.item_status === 'DELIVERED' ? (
                            <span className="category-badge badge-success badge-sm">배송완료</span>
                          ) : item.item_status === 'RETURN_REQUEST' ? (
                            <span className="category-badge badge-danger badge-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444" }}>반품 요청</span>
                          ) : item.item_status === 'RETURN_COMPLETED' ? (
                            <span className="category-badge badge-neutral badge-sm">반품 완료</span>
                          ) : item.item_status === 'CANCELLED' ? (
                            <span className="category-badge badge-neutral badge-sm">취소됨</span>
                          ) : (
                            <span className="category-badge badge-neutral badge-sm">결제완료</span>
                          )}
                        </td>
                        <td className="td-cell">
                          {item.item_status === "PAID" ? (
                            <div className="flex-row gap-xs">
                              <input 
                                type="text" 
                                className="input-field input-sm" 
                                style={{ width: "140px" }}
                                placeholder="운송장 번호 입력"
                                value={trackingInputs[item.id] || ""}
                                onChange={(e) => setTrackingInputs({ ...trackingInputs, [item.id]: e.target.value })}
                              />
                              <button 
                                className="btn-accent btn-sm"
                                onClick={() => handleTrackingSubmit(item.id)}
                              >
                                확인
                              </button>
                            </div>
                          ) : item.item_status === "RETURN_REQUEST" ? (
                            <div className="flex-col gap-xs">
                              <span className="text-12 text-muted">운송장: {item.tracking_number}</span>
                              <button 
                                className="btn-danger btn-sm"
                                onClick={() => handleReturnApprove(item.id)}
                              >
                                반품 승인
                              </button>
                            </div>
                          ) : (
                            <div className="text-13 text-secondary">
                              {item.tracking_number ? `운송장: ${item.tracking_number}` : "-"}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
