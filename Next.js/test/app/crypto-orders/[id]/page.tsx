"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../../Shopping/shopping.css";
import { PageHeader } from "@/component/PageHeader";

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
  // 트랜잭션 영수증
  block_number: number | null;
  gas_used: string | null;
  gas_used_units: string | null;
  tx_status: number | null;
  product?: {
    name: string;
    price: number;
  } | null;
}

export default function CryptoOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { email } = useAuthGuard();

  const [order, setOrder] = useState<CryptoOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!email || !id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/crypto-orders/${id}?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "암호화폐 주문 상세 내역을 불러오지 못했습니다.");
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

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="⛓️"
        title="암호화폐 결제 상세"
        subtitle={new Date(order.created_at).toLocaleString('ko-KR')}
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
                <div className="text-18-bold text-primary">{order.order_id}</div>
              </div>
              <div className="text-right">
                <div className="text-13-mono text-muted mb-1">현재 상태</div>
                <span className={`status-badge p-sm text-16 ${order.status === 'paid' ? 'active' : ''}`}
                      style={{ 
                        background: order.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                        color: order.status === "paid" ? "#10b981" : "#a5b4fc",
                        border: `1px solid ${order.status === "paid" ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.4)"}`
                      }}>
                  {order.status === 'paid' ? '✅ 결제 완료' : '⏳ 처리 중'}
                </span>
              </div>
            </div>
            
            <div className="border-top-default pt-md mt-sm flex-col gap-sm">
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">결제액</div>
                <div className="text-16-bold text-green">{order.amount ?? "—"} {order.token_symbol ?? ""}</div>
              </div>
              <div className="flex-row-center">
                <div className="text-13 text-muted w-200 flex-none">체인 이름</div>
                <div className="text-14 text-primary">{order.chain_name ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* 트랜잭션 영수증 */}
          {order.block_number && (
            <div className="card-container shop-surface border-default">
              <div className="title-banner" style={{ background: "rgba(16,185,129,0.05)" }}>
                <h2 className="margin-0 text-16-bold" style={{ color: "#10b981" }}>🧾 트랜잭션 영수증</h2>
              </div>
              <div className="p-md flex-col gap-sm">
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">트랜잭션 해시</div>
                  <div className="text-13 text-accent font-mono break-all">
                    {order.tx_hash}
                  </div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">블록 번호</div>
                  <div className="text-14-bold" style={{ color: "#a5b4fc" }}>
                    #{order.block_number.toLocaleString()}
                  </div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">실제 가스비 (가스 유닛)</div>
                  <div className="text-14-bold" style={{ color: "#f59e0b" }}>
                    ≈ {order.gas_used} ETH <span className="text-12 text-muted font-normal ml-xs">({Number(order.gas_used_units).toLocaleString()} units)</span>
                  </div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">결제자 주소 (From)</div>
                  <div className="text-13 text-primary font-mono">{order.payer}</div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">수신자 주소 (To)</div>
                  <div className="text-13 text-primary font-mono">{order.seller_wallet}</div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">트랜잭션 상태</div>
                  <div className="text-14-bold" style={{ color: order.tx_status === 1 ? "#10b981" : "#ef4444" }}>
                    {order.tx_status === 1 ? "✅ Success" : "❌ Reverted"}
                  </div>
                </div>
                <div className="flex-row-center">
                  <div className="text-13 text-muted w-200 flex-none">기록 시각</div>
                  <div className="text-14 text-primary">
                    {order.paid_at ? new Date(order.paid_at).toLocaleString("ko-KR") : "—"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 주문 상품 목록 */}
          {order.product && (
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
                    onClick={() => router.push(`/Shopping/${order.product_id}`)}
                  >
                    <td className="td-cell text-14-bold text-primary">
                      {order.product.name}
                    </td>
                    <td className="td-cell text-center"><span className="text-14 font-mono text-primary">1</span></td>
                    <td className="td-cell text-right">
                      <div className="text-14 text-primary">₩{Number(order.product.price).toLocaleString()}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
