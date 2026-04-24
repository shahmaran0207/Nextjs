"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types/shoppingType";
import "../shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

interface Review {
  id: number;
  rating: number;
  content: string;
  created_at: string;
  author: string;
}

export default function ProductDetailPage() {
  const { email } = useAuthGuard();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product & { rating?: string, reviewCount?: number, category?: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlists, setWishlists] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qty, setQty] = useState(1);
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    return Number(product.price) * qty;
  }, [product?.price, qty]);

  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);

  const [canReview, setCanReview] = useState(false);
  const [isMyProduct, setIsMyProduct] = useState(false);

  // 리뷰 페이징 및 하이라이트 관련 상태
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 10;
  
  // URL에서 하이라이트할 리뷰 ID 파싱
  const searchParams = useSearchParams();
  const highlightReviewId = searchParams.get('highlightReviewId');

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

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${id}/reviews`);
      if (res.ok) {
        const fetchedReviews = await res.json();
        setReviews(fetchedReviews);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (reviews.length > 0 && highlightReviewId) {
      const index = reviews.findIndex((r: any) => Number(r.id) === Number(highlightReviewId));
      if (index !== -1) {
        const page = Math.floor(index / reviewsPerPage) + 1;
        setReviewPage(page);
        
        // DOM 업데이트를 기다린 후 스크롤
        setTimeout(() => {
          const el = document.getElementById(`review-${highlightReviewId}`);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            el.style.backgroundColor = "rgba(56, 189, 248, 0.15)";
            el.style.transition = "background-color 0.5s ease";
            setTimeout(() => {
              el.style.backgroundColor = "rgba(255,255,255,0.03)";
            }, 2000);
          }
        }, 300);
      }
    }
  }, [reviews, highlightReviewId]);

  const fetchWishlists = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}`);
      if (res.ok) setWishlists(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const checkCanReview = async () => {
    if (!email) return setCanReview(false);
    try {
      const res = await fetch(`/api/products/${id}/reviews/can-review?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setCanReview(data.canReview);
        setIsMyProduct(data.isMyProduct);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  useEffect(() => {
    fetchWishlists();
    if (id) checkCanReview();
  }, [email, id]);

  const handlePayment = async () => {
    if (!product) return;
    sessionStorage.setItem("checkout_items", JSON.stringify([{
      product_id: product.id,
      product_name: product.name,
      unit_price: product.price,
      quantity: qty
    }]));
    sessionStorage.setItem("checkout_from_cart", "false");
    window.location.href = "/checkout";
  };

  const toggleWishlist = async () => {
    if (!email || !product) return alert("로그인이 필요합니다.");
    const pId = Number(product.id);
    const isWished = wishlists.includes(pId);

    setWishlists(prev => isWished ? prev.filter(wid => wid !== pId) : [...prev, pId]);

    try {
      if (isWished) {
        await fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}&product_id=${pId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/products/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, product_id: pId })
        });
      }
    } catch (err) {
      console.error(err);
      fetchWishlists();
    }
  };

  const submitReview = async () => {
    if (!email) return alert("로그인이 필요합니다.");
    if (!canReview) return alert("해당 상품을 구매한 이력이 있는 회원만 리뷰를 작성할 수 있습니다.");
    if (!newReviewText.trim()) return alert("리뷰 내용을 입력해주세요.");

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rating: newReviewRating, content: newReviewText })
      });
      if (res.ok) {
        setNewReviewText("");
        setNewReviewRating(5);
        fetchReviews();
        fetchProduct(); // 별점 갱신
      } else {
        const errorData = await res.json();
        alert(errorData.error || "리뷰 등록에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review.id);
    setEditReviewText(review.content);
    setEditReviewRating(review.rating);
  };

  const cancelEdit = () => {
    setEditingReviewId(null);
    setEditReviewText("");
    setEditReviewRating(5);
  };

  const updateReview = async (reviewId: number) => {
    if (!email) return;
    if (!editReviewText.trim()) return alert("리뷰 내용을 입력해주세요.");

    try {
      const res = await fetch(`/api/products/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, rating: editReviewRating, content: editReviewText })
      });
      if (res.ok) {
        cancelEdit();
        fetchReviews();
        fetchProduct();
      } else {
        alert("리뷰 수정에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const deleteReview = async (reviewId: number) => {
    if (!email) return;
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/products/reviews/${reviewId}?email=${encodeURIComponent(email)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchReviews();
        fetchProduct();
      } else {
        alert("리뷰 삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  const isWished = product ? wishlists.includes(Number(product.id)) : false;

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">📦</div>
          <div>
            <h1 className="header-title text-primary">상품 상세</h1>
            <p className="header-subtitle text-accent">{product?.name ?? "불러오는 중..."}</p>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/Shopping" className="nav-link">← 목록으로</Link>
          <Link href="/" className="nav-link">홈으로</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900" style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>

          {loading && (
            <div className="loading-container h-260 text-secondary">
              <div className="spinner" />
              <span className="text-14">상품 정보를 불러오는 중...</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && product && (
            <>
              {/* 상단 상품 정보 카드 */}
              <div className="product-detail-layout">
                <div className="card-container shop-surface border-default border-left-accent product-header-card" style={{ position: "relative" }}>
                  <button onClick={toggleWishlist} style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "40px", height: "40px", fontSize: "20px", cursor: "pointer", zIndex: 10 }}>
                    {isWished ? "❤️" : "🤍"}
                  </button>
                  <div className="product-img-box">
                    {product.has_image ? <img src={`/api/images/products/${product.id}`} alt={product.name} className="product-img-full" /> : <div className="product-img-empty"><div className="empty-box-icon">📦</div><div className="text-12">이미지 없음</div></div>}
                  </div>
                  <div className="product-info-col">
                    <div>
                      <div className="status-badge-wrapper flex-justify-between">
                        <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                          {product.is_active ? "✓ 판매중" : "✕ 판매중지"}
                        </span>
                        <span className="text-13-mono text-muted">{product.category || "etc"}</span>
                      </div>
                      <h2 className="product-title">{product.name}</h2>
                      <div className="text-14 text-accent mb-1rem">
                        ⭐ {product.rating || "0.0"} ({product.reviewCount || 0}개의 리뷰)
                      </div>
                      <p className="product-desc">{product.description ?? "설명이 없습니다."}</p>
                    </div>
                    <div className="product-price-box border-default bg-surface-inner">
                      <div className="flex-justify-between w-full">
                        <span className="text-13 text-muted">판매가</span>
                        <span className="text-22-money text-green">₩{Number(product.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 우측 결제 패널 */}
                <div className="card-container shop-surface border-default product-side-panel">
                  <h3 className="panel-title text-primary">결제 정보</h3>
                  <div className="panel-content">
                    <div className="flex-justify-between mb-1rem">
                      <span className="text-13 text-muted">수량 선택</span>
                      <div className="qty-control border-default">
                        <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                        <span className="qty-val font-mono">{qty}</span>
                        <button className="qty-btn" onClick={() => setQty(qty + 1)} disabled={qty >= product.stock}>+</button>
                      </div>
                    </div>
                    <div className="flex-justify-between mb-1rem border-bottom-default pb-1rem">
                      <span className="text-13 text-muted">재고 현황</span>
                      <span className={`text-13-mono ${product.stock > 0 ? "text-primary" : "text-red"}`}>{product.stock.toLocaleString()} 개</span>
                    </div>
                    <div className="flex-justify-between mt-auto pt-1rem mb-1rem">
                      <span className="text-14-bold text-primary">총 결제예상</span>
                      <span className="text-24-money text-green">₩{totalPrice.toLocaleString()}</span>
                    </div>

                    {!isMyProduct ? (
                      <div style={{ display: "flex", gap: "10px", flexDirection: "column" }}>
                        <button 
                          className="btn-primary" 
                          style={{ padding: "14px", fontSize: "16px", fontWeight: "bold", background: "var(--accent)", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", opacity: (!product.is_active || product.stock <= 0) ? 0.5 : 1 }} 
                          disabled={!product.is_active || product.stock <= 0} 
                          onClick={async () => {
                            if (!email) return alert("로그인이 필요합니다.");
                            try {
                              const res = await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email, product_id: product.id, quantity: qty, unit_price: product.price })
                              });
                              if (res.ok) {
                                if(confirm("장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?")) {
                                  window.location.href = "/cart";
                                }
                              } else {
                                const errData = await res.json();
                                alert(errData.error || "장바구니 담기에 실패했습니다.");
                              }
                            } catch (err) {
                              alert("오류가 발생했습니다.");
                            }
                          }}
                        >
                          🛒 장바구니 담기
                        </button>
                        <button 
                          className="btn-primary" 
                          style={{ padding: "14px", fontSize: "16px", fontWeight: "bold", background: "#10b981", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", opacity: (!product.is_active || product.stock <= 0) ? 0.5 : 1 }} 
                          disabled={!product.is_active || product.stock <= 0} 
                          onClick={handlePayment}
                        >
                          {!product.is_active ? "판매 중지됨" : product.stock <= 0 ? "품절" : "💳 바로 결제하기"}
                        </button>
                      </div>
                    ) : (
                      <div className="error-container text-center mt-1rem" style={{ padding: "1rem" }}>
                        본인이 등록한 상품은 결제 및 장바구니 담기가 불가능합니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 리뷰 섹션 */}
              <div className="card-container shop-surface border-default">
                <div className="title-banner border-bottom-default">
                  <h2 className="margin-0 text-primary" style={{ fontSize: "16px" }}>상품 리뷰 ({reviews.length})</h2>
                </div>

                {/* 리뷰 작성 폼 (권한이 있을 때만 표시) */}
                {canReview && (
                  <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.1)" }}>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", color: "var(--bg-primary)", flexShrink: 0 }}>
                        👤
                      </div>
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className="text-13 text-muted">별점 평가</span>
                          <select 
                            value={newReviewRating} 
                            onChange={e => setNewReviewRating(Number(e.target.value))} 
                            className="search-input" 
                            style={{ padding: "2px 8px", fontSize: "13px", height: "auto" }}
                          >
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{"⭐".repeat(r)}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <textarea
                            className="search-input"
                            rows={2}
                            placeholder="이 상품에 대한 리뷰를 남겨주세요."
                            value={newReviewText}
                            onChange={e => setNewReviewText(e.target.value)}
                            style={{ flex: 1, resize: "none" }}
                          />
                          <button 
                            onClick={submitReview} 
                            className="btn-primary" 
                            style={{ padding: "0 20px", whiteSpace: "nowrap" }}
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 리뷰 목록 */}
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {reviews.length === 0 ? (
                    <div className="text-center text-muted" style={{ padding: "2rem 0" }}>등록된 리뷰가 없습니다.</div>
                  ) : (
                    <>
                      {reviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage).map((review: any) => (
                        <div key={review.id} id={`review-${review.id}`} style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {editingReviewId === review.id ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="text-13 text-muted">별점 수정</span>
                                <select 
                                  value={editReviewRating} 
                                  onChange={e => setEditReviewRating(Number(e.target.value))} 
                                  className="search-input" 
                                  style={{ padding: "2px 8px", fontSize: "13px", height: "auto" }}
                                >
                                  {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{"⭐".repeat(r)}</option>)}
                                </select>
                              </div>
                              <textarea
                                className="search-input"
                                rows={2}
                                value={editReviewText}
                                onChange={e => setEditReviewText(e.target.value)}
                                style={{ flex: 1, resize: "none" }}
                              />
                              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                                <button onClick={cancelEdit} className="btn-outline-secondary">취소</button>
                                <button onClick={() => updateReview(review.id)} className="btn-primary" style={{ padding: "6px 12px" }}>저장</button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex-justify-between mb-6px">
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <span className="text-14-bold text-primary">{review.author}</span>
                                  <span className="text-12 text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                                {email && review.authorEmail === email && (
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button onClick={() => handleEditClick(review)} className="btn-outline-secondary" style={{ fontSize: "11px", padding: "2px 6px" }}>수정</button>
                                    <button onClick={() => deleteReview(review.id)} className="btn-delete-small" style={{ fontSize: "11px", padding: "2px 6px" }}>삭제</button>
                                  </div>
                                )}
                              </div>
                              <div className="text-13 text-accent mb-6px">{"⭐".repeat(review.rating)}</div>
                              <p className="text-14 text-secondary margin-0" style={{ lineHeight: "1.5" }}>{review.content}</p>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {/* 페이징 UI */}
                      {reviews.length > reviewsPerPage && (
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "1.5rem" }}>
                          <button 
                            onClick={() => setReviewPage(p => Math.max(1, p - 1))} 
                            disabled={reviewPage === 1}
                            className="btn-outline-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                          >
                            이전
                          </button>
                          {[...Array(Math.ceil(reviews.length / reviewsPerPage))].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setReviewPage(i + 1)}
                              className={reviewPage === i + 1 ? "btn-primary" : "btn-outline-secondary"}
                              style={{ padding: "6px 12px", fontSize: "13px", minWidth: "32px" }}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button 
                            onClick={() => setReviewPage(p => Math.min(Math.ceil(reviews.length / reviewsPerPage), p + 1))} 
                            disabled={reviewPage === Math.ceil(reviews.length / reviewsPerPage)}
                            className="btn-outline-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                          >
                            다음
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

            </>
          )}

        </div>
      </main>
    </div>
  );
}
