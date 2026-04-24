"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { dark } from "@/app/QnA/[id]/component/theme";
import Link from "next/link";
import { Product } from "@/types/shoppingType";
import "../shopping.css";
import axios from "axios";
import { RequestPayParams, RequestPayResponse } from "@/types/paymentType";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

/* ─── 결제 결과 callback 함수 ───────────────────────────────── */
function callback(response: RequestPayResponse) {
  console.log("Full response:", response);
  const { success, error_msg, imp_uid } = response;

  if (success) {
    axios.post(`/api/orders/${imp_uid}`);
    alert("결제 성공!!!");
  } else {
    alert(`결제 실패:::: ${error_msg}`);
  }
}

/* ─── 정보 행 컴포넌트 ───────────────────────────────── */
function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <tr className="detail-table-row">
      <td className="info-row-label">
        {label}
      </td>
      <td className={`info-row-value ${accent ? "accent" : "normal"}`}>
        {value}
      </td>
    </tr>
  );
}

/* ─── 페이지 ─────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { email, name } = useAuthGuard();

  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qty, setQty] = useState(1);
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price) * qty;
  }, [product?.price, qty]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/Shopping/Products/${id}`);
        if (!res.ok) throw new Error("상품 정보를 불러오지 못했습니다.");
        const data = await res.json();
        if (!data || data.error) throw new Error(data?.error ?? "상품을 찾을 수 없습니다.");
        setProduct(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  const handlePayment = async () => {
    console.log("name:::::::::", name);
    console.log
    if (!window.IMP) return;

    const { IMP } = window;
    IMP.init("imp08348266");

    const data: RequestPayParams = {
      pg: "html5_inicis",
      channel_key: "channel-key-a430aad8-4b56-4c03-a96a-af05565eec6e",
      pay_method: "card",
      merchant_uid: `mid_${new Date().getTime()}`,
      amount: totalPrice,
      name: product?.name,
      buyer_name: email,
      buyer_tel: "010-1112-4885",
      buyer_email: email,
      buyer_addr: "부산 수영구",
      buyer_postcode: "48870",
      app_scheme: "digitalTwin",
    };
    IMP.request_pay(data, callback);
  };

  return (
    <div className="page-container shop-bg">

      {/* 배경 그리드 */}
      <div className="bg-grid" />

      {/* 헤더 */}
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">
            📦
          </div>
          <div>
            <h1 className="header-title text-primary">
              상품 상세
            </h1>
            <p className="header-subtitle text-accent">
              {product?.name ?? "불러오는 중..."}
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/Shopping" className="nav-link">
            ← 목록으로
          </Link>
          <Link href="/" className="nav-link">
            홈으로
          </Link>
        </nav>
      </header>

      {/* 본문 */}
      <main className="page-main">
        <div className="content-wrapper max-w-900">

          {/* 로딩 */}
          {loading && (
            <div className="loading-container h-260 text-secondary">
              <div className="spinner" />
              <span className="text-14">상품 정보를 불러오는 중...</span>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="error-container">
              ⚠️ {error}
            </div>
          )}

          {/* 상품 상세 */}
          {!loading && !error && product && (
            <div className="product-detail-layout">

              {/* 상단 카드 - 이미지 + 핵심 정보 */}
              <div className="card-container shop-surface border-default border-left-accent product-header-card">
                {/* 이미지 */}
                <div className="product-img-box">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="product-img-full"
                    />
                  ) : (
                    <div className="product-img-empty">
                      <div className="empty-box-icon">📦</div>
                      <div className="text-12">이미지 없음</div>
                    </div>
                  )}
                </div>

                {/* 핵심 정보 */}
                <div className="product-info-col">
                  <div>
                    {/* 상태 배지 */}
                    <div className="status-badge-wrapper">
                      <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                        {product.is_active ? "✓ 판매중" : "✕ 판매중지"}
                      </span>
                    </div>

                    <h2 className="product-title">
                      {product.name}
                    </h2>

                    <p className="product-desc">
                      {product.description ?? "설명이 없습니다."}
                    </p>
                  </div>

                  {/* 가격 / 재고 */}
                  <div className="product-price-row">
                    <div>
                      <div className="product-price-label">가격</div>
                      <div className="text-28-money text-green">
                        ₩{Number(product.price).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="product-price-label">재고</div>
                      <div className={`text-22-bold font-mono ${product.stock > 0 ? 'text-primary' : 'text-red'}`}>
                        {product.stock.toLocaleString()}
                        <span className="text-13 text-muted" style={{ marginLeft: "6px" }}>개</span>
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const isSoldOut = product.stock === 0;
                    return (
                      <div className={`purchase-box ${isSoldOut ? 'soldout' : 'available'}`}>

                        {/* 품절 배너 */}
                        {isSoldOut && (
                          <div className="soldout-banner">
                            <span style={{ fontSize: "16px" }}>🚫</span>
                            재고가 없어 구매할 수 없습니다.
                          </div>
                        )}

                        {/* 수량 + 합계 */}
                        <div className="qty-row">
                          <div className="qty-controls">
                            <span className={`qty-label ${isSoldOut ? 'qty-label-soldout' : 'qty-label-available'}`}>수량</span>
                            <div className={`qty-input-group ${isSoldOut ? 'soldout' : 'available'}`}>
                              <button
                                disabled={isSoldOut}
                                onClick={() => setQty(q => Math.max(1, q - 1))}
                                className="qty-btn"
                              >−</button>
                              <input
                                type="number"
                                min={1}
                                max={product.stock}
                                value={qty}
                                disabled={isSoldOut}
                                onChange={e => {
                                  const v = parseInt(e.target.value);
                                  if (!isNaN(v)) setQty(Math.min(Math.max(1, v), product.stock));
                                }}
                                className="qty-input"
                              />
                              <button
                                disabled={isSoldOut || qty >= product.stock}
                                onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                                className="qty-btn"
                              >＋</button>
                            </div>
                          </div>

                          {/* 합계 금액 */}
                          {!isSoldOut && (
                            <div className="total-price-box">
                              <span className="qty-label qty-label-available">합계</span>
                              <span className="text-20-money text-green">
                                ₩{totalPrice.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* 버튼 그룹 */}
                        <div className="button-group">
                          {/* 장바구니 버튼 */}
                          <button
                            disabled={isSoldOut}
                            className="cart-btn"
                          >
                            🛒 장바구니 담기
                          </button>

                          {/* 결제 버튼 */}
                          <button
                            onClick={handlePayment}
                            disabled={isSoldOut}
                            className="pay-btn"
                          >
                            ⚡ {isSoldOut ? "구매 불가" : `₩${totalPrice.toLocaleString()} 결제하기`}
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 하단 - 상세 테이블 */}
              <div className="card-container shop-surface border-default">
                <div className="detail-table-header">
                  <span className="category-badge" style={{
                    background: dark.accentDim, color: dark.accent,
                  }}>
                    상세 정보
                  </span>
                </div>
                <table className="shopping-table">
                  <tbody>
                    <InfoRow label="상품 ID" value={String(product.id)} accent />
                    <InfoRow label="SKU" value={product.sku ?? "-"} />
                    <InfoRow
                      label="등록일"
                      value={new Date(product.created_at).toLocaleString("ko-KR", {
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    />
                    <InfoRow
                      label="수정일"
                      value={new Date(product.updated_at).toLocaleString("ko-KR", {
                        year: "numeric", month: "2-digit", day: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    />
                    {product.image_url && (
                      <InfoRow
                        label="이미지 URL"
                        value={
                          <a
                            href={product.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-13 text-accent break-all"
                          >
                            {product.image_url}
                          </a>
                        }
                      />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
