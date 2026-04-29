"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../../Shopping/shopping.css";
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

interface CryptoOrderDetail {
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
  receiver_name: string | null;
  receiver_phone: string | null;
  shipping_address: string | null;
  shipping_message: string | null;
  block_number: number | null;
  gas_used: string | null;
  gas_used_units: string | null;
  tx_status: number | null;
  tracking_number: string | null;
  product?: {
    name: string;
    price: number;
  } | null;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { email } = useAuthGuard();

  const [order, setOrder] = useState<OrderDetail | CryptoOrderDetail | null>(null);
  const [isCrypto, setIsCrypto] = useState(false);
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
        setIsCrypto(data.is_crypto);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (email && id) fetchOrderDetail();
  }, [email, id]);

  // 실시간 배송(운송장) 업데이트 웹소켓 리스너
  useEffect(() => {
    let ws: WebSocket | null = null;
    if (order) {
      ws = new WebSocket("ws://localhost:3001");
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SHIPPING_UPDATED') {
            const isMatch = isCrypto 
              ? (order as CryptoOrderDetail).order_id === data.orderId 
              : String(id) === data.orderId;
              
            if (isMatch) {
              alert(`운송장 번호(${data.trackingNumber})가 등록되어 배송이 시작되었습니다!`);
              window.location.reload();
            }
          }
        } catch (err) {}
      };
    }
    return () => ws?.close();
  }, [order, id, isCrypto]);

  const updateOrderStatus = async (action: "CANCEL" | "CONFIRM" | "RETURN_REQUEST") => {
    const actionText = action === "CANCEL" ? "주문을 취소" : action === "RETURN_REQUEST" ? "반품 요청" : "구매를 확정";
    if (!confirm(`정말 이 ${actionText}하시겠습니까?`)) return;

    try {
      let res;
      if (action === "CANCEL") {
        res = await fetch(`/api/orders/${id}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      } else {
        res = await fetch(`/api/orders/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, email })
        });
      }
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

  const releaseCryptoEscrow = async () => {
    if (!confirm("상품을 수령하셨습니까? 구매 확정 시 판매자에게 에스크로 대금이 지급됩니다.")) return;
    try {
      const cryptoOrder = order as CryptoOrderDetail;
      const res = await fetch("http://localhost:3001/api/crypto/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: cryptoOrder.order_id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`구매가 확정되었습니다. (TxHash: ${data.txHash})`);
        window.location.reload();
      } else {
        alert(data.error || "자금 해제에 실패했습니다.");
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

  if (isCrypto) {
    const cryptoOrder = order as CryptoOrderDetail;
    return (
      <div className="page-container shop-bg">
        <div className="bg-grid" />
        <PageHeader
          icon="⛓️"
          title="암호화폐 결제 상세"
          subtitle={new Date(cryptoOrder.created_at).toLocaleString('ko-KR')}
          navLinks={[
            { href: "/", label: "메인 페이지" },
            { href: "/orders", label: "주문 내역으로" },
          ]}
        />
  
        <main className="page-main">
          <div className="content-wrapper max-w-900 flex-col gap-lg">
            
            {/* 상단 주문 요약 */}
            <div className="card-container shop-surface border-default p-md flex-col gap-md">
              <div className="flex-justify-between">
                <div>
                  <div className="text-13-mono text-muted mb-1">주문번호</div>
                  <div className="text-18-bold text-primary">{cryptoOrder.order_id}</div>
                </div>
                <div className="text-right">
                  <div className="text-13-mono text-muted mb-1">현재 상태</div>
                  {(() => {
                    let text = '⏳ 처리 중';
                    let bg = 'rgba(99,102,241,0.15)';
                    let color = '#a5b4fc';
                    let border = 'rgba(99,102,241,0.4)';

                    if (cryptoOrder.status === 'paid') {
                      text = '✅ 결제 완료';
                      bg = 'rgba(16,185,129,0.15)';
                      color = '#10b981';
                      border = 'rgba(16,185,129,0.4)';
                    } else if (cryptoOrder.status === 'escrow_locked') {
                      text = '🔒 에스크로 보관 중';
                      bg = 'rgba(245,158,11,0.15)';
                      color = '#f59e0b';
                      border = 'rgba(245,158,11,0.4)';
                    } else if (cryptoOrder.status === 'released') {
                      text = '💸 정산 완료';
                      bg = 'rgba(59,130,246,0.15)';
                      color = '#3b82f6';
                      border = 'rgba(59,130,246,0.4)';
                    }

                    return (
                      <span className={`status-badge p-sm text-16 ${cryptoOrder.status !== 'pending' ? 'active' : ''}`}
                            style={{ background: bg, color, border: `1px solid ${border}` }}>
                        {text}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {cryptoOrder.status === 'escrow_locked' && cryptoOrder.tracking_number ? (
                <div className="flex-justify-end gap-xs border-top-default pt-md mt-sm">
                  <button onClick={releaseCryptoEscrow} className="btn-success">
                    상품 수령 (구매 확정)
                  </button>
                </div>
              ) : cryptoOrder.status === 'escrow_locked' && !cryptoOrder.tracking_number ? (
                <div className="flex-justify-end gap-xs border-top-default pt-md mt-sm">
                  <div className="text-13 text-muted">판매자의 발송(운송장 등록)을 기다리고 있습니다.</div>
                </div>
              ) : null}
              
              <div className="border-top-default pt-md mt-sm flex-col gap-sm">
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">결제액</div>
                  <div className="text-16-bold text-green">{cryptoOrder.amount ?? "—"} {cryptoOrder.token_symbol ?? ""}</div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">체인 이름</div>
                  <div className="text-14 text-primary">{cryptoOrder.chain_name ?? "—"}</div>
                </div>
              </div>
            </div>
  
            {/* 트랜잭션 영수증 */}
            {cryptoOrder.block_number && (
              <div className="card-container shop-surface border-default">
                <div className="title-banner" style={{ background: "rgba(16,185,129,0.05)" }}>
                  <h2 className="margin-0 text-16-bold" style={{ color: "#10b981" }}>🧾 트랜잭션 영수증</h2>
                </div>
                <div className="p-md flex-col gap-sm">
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">트랜잭션 해시</div>
                    <div className="text-13 text-accent font-mono break-all">
                      {cryptoOrder.tx_hash}
                    </div>
                  </div>
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">블록 번호</div>
                    <div className="text-14-bold" style={{ color: "#a5b4fc" }}>
                      #{cryptoOrder.block_number.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">실제 가스비 (가스 유닛)</div>
                    <div className="text-14-bold" style={{ color: "#f59e0b" }}>
                      ≈ {cryptoOrder.gas_used} ETH <span className="text-12 text-muted font-normal ml-xs">({Number(cryptoOrder.gas_used_units).toLocaleString()} units)</span>
                    </div>
                  </div>
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">결제자 주소 (From)</div>
                    <div className="text-13 text-primary font-mono">{cryptoOrder.payer}</div>
                  </div>
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">수신자 주소 (To)</div>
                    <div className="text-13 text-primary font-mono">{cryptoOrder.seller_wallet}</div>
                  </div>
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">트랜잭션 상태</div>
                    <div className="text-14-bold" style={{ color: cryptoOrder.tx_status === 1 ? "#10b981" : "#ef4444" }}>
                      {cryptoOrder.tx_status === 1 ? "✅ Success" : "❌ Reverted"}
                    </div>
                  </div>
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">기록 시각</div>
                    <div className="text-14 text-primary">
                      {cryptoOrder.paid_at ? new Date(cryptoOrder.paid_at).toLocaleString("ko-KR") : "—"}
                    </div>
                  </div>
                </div>
              </div>
            )}
  
            {/* 주문 상품 목록 */}
            {cryptoOrder.product && (
              <div className="card-container shop-surface border-default">
                <div className="title-banner">
                  <h2 className="margin-0 text-primary text-16">주문 상품</h2>
                </div>
                <table className="shopping-table">
                  <thead>
                    <tr>
                      <th className="shopping-th">상품명</th>
                      <th className="shopping-th text-center">수량</th>
                      <th className="shopping-th text-right">기준가 (KRW)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className={`product-row cursor-pointer`}
                      onClick={() => router.push(`/Shopping/${cryptoOrder.product_id}`)}
                    >
                      <td className="td-cell text-14-bold text-primary">
                        {cryptoOrder.product.name}
                      </td>
                      <td className="td-cell text-center"><span className="text-14 font-mono text-primary">1</span></td>
                      <td className="td-cell text-right">
                        <div className="text-14 text-primary">₩{Number(cryptoOrder.product.price).toLocaleString()}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            {/* 배송지 정보 (암호화폐 주문용) */}
            <div className="card-container shop-surface border-default">
              <div className="title-banner">
                <h2 className="margin-0 text-primary text-16">배송 정보</h2>
              </div>
              <div className="p-md flex-col gap-sm">
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">수령인</div>
                  <div className="text-14 text-primary">{cryptoOrder.receiver_name || "-"}</div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">연락처</div>
                  <div className="text-14 text-primary">{cryptoOrder.receiver_phone || "-"}</div>
                </div>
                <div className="flex-row items-start">
                  <div className="text-13 text-muted w-200 flex-none mt-2px">배송지 주소</div>
                  <div className="text-14 text-primary break-all line-height-15">{cryptoOrder.shipping_address || "-"}</div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">배송 요청사항</div>
                  <div className="text-14 text-primary">{cryptoOrder.shipping_message || "-"}</div>
                </div>
                {cryptoOrder.tracking_number && (
                  <div className="flex-row-center">
                    <div className="text-13 text-muted w-200 flex-none">운송장 번호</div>
                    <div className="text-14-bold text-accent">{cryptoOrder.tracking_number}</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    );
  }

  // 일반 주문 (카드 결제 등) 렌더링
  const normalOrder = order as OrderDetail;

  const statusMap: Record<string, string> = {
    PENDING: "결제 대기",
    PAID: "결제 완료",
    SHIPPED: "배송 중",
    DELIVERED: "배송 완료",
    CONFIRMED: "구매 확정",
    CANCELLED: "취소됨",
    RETURN_REQUEST: "반품 요청",
    RETURN_COMPLETED: "반품 완료",
  };
  const statusText = statusMap[normalOrder.order_status] ?? normalOrder.order_status;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="📦"
        title="주문 상세"
        subtitle={new Date(normalOrder.ordered_at).toLocaleString('ko-KR')}

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/orders", label: "주문 내역으로" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900 flex-col gap-lg">

          {/* 상단 주문 요약 */}
          <div className="card-container shop-surface border-default p-md flex-col gap-md">
            <div className="flex-justify-between">
              <div>
                <div className="text-13-mono text-muted mb-1">주문번호</div>
                <div className="text-18-bold text-primary">{normalOrder.order_number}</div>
              </div>
              <div className="text-right">
                <div className="text-13-mono text-muted mb-1">현재 상태</div>
                <span className="status-badge active p-sm text-16">{statusText}</span>
              </div>
            </div>

            {/* 상태 변경 액션 버튼 */}
            <div className="flex-justify-end gap-xs border-top-default pt-md mt-sm">
              {(normalOrder.order_status === "PAID" || normalOrder.order_status === "PENDING") && (
                <button
                  onClick={() => updateOrderStatus("CANCEL")}
                  className="btn-outline-secondary"
                >
                  주문 취소
                </button>
              )}
              {normalOrder.order_status === "SHIPPED" && (
                <button
                  onClick={() => updateOrderStatus("CONFIRM")}
                  className="btn-success"
                >
                  상품 수령 (구매 확정)
                </button>
              )}
              {normalOrder.order_status === "DELIVERED" && (
                <button
                  onClick={() => updateOrderStatus("RETURN_REQUEST")}
                  className="btn-danger"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid #ef4444" }}
                >
                  반품 요청
                </button>
              )}
            </div>
          </div>

          {/* 주문 상품 목록 */}
          <div className="card-container shop-surface border-default">
            <div className="title-banner">
              <h2 className="margin-0 text-primary text-16">주문 상품 ({normalOrder.items.length}개)</h2>
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
                {normalOrder.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`product-row ${idx % 2 === 0 ? "td-cell-even" : "td-cell-odd"} cursor-pointer`}
                    onClick={() => router.push(`/Shopping/${item.product_id}`)}
                  >
                    <td className="td-cell text-14-bold text-primary">
                      {item.product_name}
                      {item.option_name && <span className="text-13 text-accent ml-xs">({item.option_name})</span>}
                      {item.tracking_number && (
                        <div className="text-11 text-muted mt-4px">운송장: {item.tracking_number}</div>
                      )}
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
              <span className="text-20-money text-green flex-row gap-xs">₩{Number(normalOrder.final_amount).toLocaleString()}</span>
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
                <div className="text-14 text-primary">{normalOrder.receiver_name || "-"}</div>
              </div>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">연락처</div>
                <div className="text-14 text-primary">{normalOrder.receiver_phone || "-"}</div>
              </div>
              <div className="flex-row items-start">
                <div className="text-13 text-muted w-200 flex-none mt-2px">배송지 주소</div>
                <div className="text-14 text-primary break-all line-height-15">{normalOrder.shipping_address || "-"}</div>
              </div>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">배송 요청사항</div>
                <div className="text-14 text-primary">{normalOrder.shipping_message || "-"}</div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
