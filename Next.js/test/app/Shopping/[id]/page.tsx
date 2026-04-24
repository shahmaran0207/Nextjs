"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types/shoppingType";
import "../shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { NotificationBell } from "@/component/NotificationBell";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [product, setProduct] = useState<Product & { rating?: string, reviewCount?: number, category?: string, options?: any[] } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [wishlists, setWishlists] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<any>(null);

  const [qty, setQty] = useState(1);
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    const basePrice = Number(product.price);
    const addPrice = selectedOption ? Number(selectedOption.add_price) : 0;
    return (basePrice + addPrice) * qty;
  }, [product?.price, qty, selectedOption]);

  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewImage, setNewReviewImage] = useState<File | null>(null);

  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [editReviewRating, setEditReviewRating] = useState(5);

  const [canReview, setCanReview] = useState(false);
  const [isMyProduct, setIsMyProduct] = useState(false);

  // 추가 기능 상태
  const [flashSale, setFlashSale] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [followInfo, setFollowInfo] = useState({ isFollowing: false, count: 0 });
  const [sellerId, setSellerId] = useState<number | null>(null);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);
  const [helpfulMap, setHelpfulMap] = useState<Record<number, { count: number; voted: boolean }>>({});
  const [compareIds, setCompareIds] = useState<number[]>([]);

  // 리뷰 페이지네이션
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 10;
  const highlightReviewId = searchParams.get('highlightReviewId');

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/Shopping/Products/${id}`);
      if (!res.ok) throw new Error("상품 정보를 불러올 수 없습니다.");
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

      // 최근 본 상품 저장
      const MAX_RECENT = 10;
      const key = "recently_viewed";
      const existing = JSON.parse(sessionStorage.getItem(key) || "[]") as number[];
      const numId = Number(id);
      const filtered = existing.filter(pid => pid !== numId);
      const updated = [numId, ...filtered].slice(0, MAX_RECENT);
      sessionStorage.setItem(key, JSON.stringify(updated));

      // 비교 목록 로드
      const cids = JSON.parse(sessionStorage.getItem("compare_ids") || "[]") as number[];
      setCompareIds(cids);
    }
  }, [id]);

  useEffect(() => {
    fetchWishlists();
    if (id) checkCanReview();
  }, [email, id]);

  const handlePayment = async () => {
    if (!product) return;
    if (product.options && product.options.length > 0 && !selectedOption) {
      return alert("상품 옵션을 선택해주세요.");
    }
    
    sessionStorage.setItem("checkout_items", JSON.stringify([{
      product_id: product.id,
      product_name: product.name,
      unit_price: Number(product.price) + (selectedOption ? Number(selectedOption.add_price) : 0),
      quantity: qty,
      option_name: selectedOption ? selectedOption.option_name : null
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
      const formData = new FormData();
      formData.append("email", email);
      formData.append("rating", String(newReviewRating));
      formData.append("content", newReviewText);
      if (newReviewImage) {
        formData.append("image", newReviewImage);
      }

      const res = await fetch(`/api/products/${id}/reviews`, {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        setNewReviewText("");
        setNewReviewRating(5);
        setNewReviewImage(null);
        fetchReviews();
        fetchProduct();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "리뷰 등록에 실패했습니다.");
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
        <div className="flex-row gap-sm">
          <div className="logo-icon">🛍️</div>
          <div>
            <h1 className="header-title text-primary">상품 상세</h1>
            <p className="header-subtitle text-accent">{product?.name ?? "불러오는 중.."}</p>
          </div>
        </div>
        <nav className="flex-row gap-xs items-center">
          <NotificationBell />
          <Link href="/Shopping" className="nav-link">상품 목록으로</Link>
          <Link href="/" className="nav-link">홈으로</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900 flex-col gap-lg">

          {loading && (
            <div className="loading-container h-260 text-secondary">
              <div className="spinner" />
              <span className="text-14">상품 정보를 불러오는 중..</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && product && (
            <>
              {/* 상품 정보 카드 */}
              <div className="product-detail-layout">
                <div className="card-container shop-surface border-default border-left-accent product-header-card relative">
                  <button onClick={toggleWishlist} style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "40px", height: "40px", fontSize: "20px", cursor: "pointer", zIndex: 10 }}>
                    {isWished ? "❤️" : "🤍"}
                  </button>
                  <div className="product-img-box">
                    {product.has_image ? (
                      <img src={`/api/images/products/${product.id}`} alt={product.name} className="product-img-full" />
                    ) : (
                      <div className="product-img-empty">
                        <div className="empty-box-icon">📷</div>
                        <div className="text-12">이미지 없음</div>
                      </div>
                    )}
                  </div>
                  <div className="product-info-col">
                    <div>
                      <div className="status-badge-wrapper flex-justify-between items-center mb-xs">
                        <div className="flex-row gap-xs items-center">
                          <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                            {product.is_active ? "판매중" : "판매중단"}
                          </span>
                        </div>
                        <span className="text-13-mono text-muted">{product.category || "etc"}</span>
                      </div>

                      <div className="flex-row-between items-start mb-xs">
                        <h2 className="product-title margin-0">{product.name}</h2>
                      </div>

                      <div className="text-14 text-accent mb-1rem">
                        ⭐{product.rating || "0.0"} ({product.reviewCount || 0}개의 리뷰)
                      </div>
                      <p className="product-desc">{product.description ?? "설명이 없습니다."}</p>
                    </div>
                    <div className="product-price-box border-default bg-surface-inner">
                      <div className="flex-justify-between w-full items-center">
                        <span className="text-13 text-muted">판매가</span>
                        <div className="flex-col items-end">
                          <span className="text-22-money text-green">₩{Number(product.price).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 결제 패널 */}
                <div className="card-container shop-surface border-default product-side-panel">
                  <h3 className="panel-title text-primary">결제 정보</h3>
                  <div className="panel-content">
                    
                    {product.options && product.options.length > 0 && (
                      <div className="mb-1rem border-bottom-default pb-1rem">
                        <span className="text-13 text-muted block mb-6px">옵션 선택 *</span>
                        <select 
                          className="input-field w-full"
                          value={selectedOption ? selectedOption.option_name : ""}
                          onChange={(e) => {
                            const opt = product.options?.find(o => o.option_name === e.target.value);
                            setSelectedOption(opt || null);
                            setQty(1);
                          }}
                        >
                          <option value="">옵션을 선택하세요</option>
                          {product.options.map(opt => (
                            <option key={opt.id} value={opt.option_name} disabled={opt.stock <= 0}>
                              {opt.option_name} {opt.add_price > 0 ? `(+${opt.add_price}원)` : ""} {opt.stock <= 0 ? "(품절)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex-justify-between mb-1rem">
                      <span className="text-13 text-muted">수량 선택</span>
                      <div className="qty-control border-default">
                        <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
                        <span className="qty-val font-mono">{qty}</span>
                        <button className="qty-btn" onClick={() => setQty(qty + 1)} disabled={selectedOption ? qty >= selectedOption.stock : qty >= product.stock}>+</button>
                      </div>
                    </div>
                    
                    <div className="flex-justify-between mb-1rem border-bottom-default pb-1rem">
                      <span className="text-13 text-muted">재고 현황</span>
                      <span className={`text-13-mono ${((selectedOption ? selectedOption.stock : product.stock) > 0) ? "text-primary" : "text-red"}`}>
                        {selectedOption ? selectedOption.stock.toLocaleString() : product.stock.toLocaleString()} 개
                      </span>
                    </div>
                    
                    <div className="flex-justify-between mt-auto pt-1rem mb-1rem">
                      <span className="text-14-bold text-primary">총 결제예상</span>
                      <span className="text-24-money text-green">
                        ₩{totalPrice.toLocaleString()}
                      </span>
                    </div>

                    {!isMyProduct ? (
                      <div className="flex-col gap-sm">
                        <button
                          className="btn-accent btn-lg w-full"
                          disabled={!product.is_active || (selectedOption ? selectedOption.stock <= 0 : product.stock <= 0) || (product.options && product.options.length > 0 && !selectedOption)}
                          onClick={async () => {
                            if (!email) return alert("로그인이 필요합니다.");
                            if (product.options && product.options.length > 0 && !selectedOption) return alert("상품 옵션을 선택해주세요.");
                            try {
                              const base = Number(product.price) + (selectedOption ? Number(selectedOption.add_price) : 0);
                              const unit_price = base;
                              const option_name = selectedOption ? selectedOption.option_name : null;

                              const res = await fetch("/api/cart", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ email, product_id: product.id, quantity: qty, unit_price, option_name })
                              });
                              if (res.ok) {
                                if (confirm("장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?")) window.location.href = "/cart";
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
                          className="btn-success btn-lg w-full"
                          disabled={!product.is_active || (selectedOption ? selectedOption.stock <= 0 : product.stock <= 0) || (product.options && product.options.length > 0 && !selectedOption)}
                          onClick={handlePayment}
                        >
                          {!product.is_active ? "판매 중단됨" : (selectedOption ? selectedOption.stock <= 0 : product.stock <= 0) ? "품절" : "💳 바로 결제하기"}
                        </button>
                      </div>
                    ) : (
                      <div className="error-container text-center mt-sm p-sm">
                        본인이 등록한 상품은 결제 및 장바구니 담기가 불가능합니다.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 리뷰 섹션 */}
              <div className="card-container shop-surface border-default">
                <div className="title-banner border-bottom-default">
                  <h2 className="margin-0 text-primary text-16">상품 리뷰 ({reviews.length})</h2>
                </div>

                {/* 리뷰 작성 폼 */}
                {canReview && (
                  <div className="p-md bg-dim border-bottom-default">
                    <div className="flex-row items-start gap-sm">
                      <div className="shrink-0">
                        👤
                      </div>
                      <div className="flex-col gap-xs flex-1">
                        <div className="flex-row gap-xs items-center">
                          <span className="text-13 text-muted">별점 선택</span>
                          <select
                            value={newReviewRating}
                            onChange={e => setNewReviewRating(Number(e.target.value))}
                            className="input-field p-sm w-auto"
                          >
                            {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{"⭐".repeat(r)}</option>)}
                          </select>
                        </div>
                        <div className="flex-row gap-xs w-full items-end">
                          <div className="flex-1 flex-col gap-xs">
                            <textarea
                              className="input-field w-full textarea-field"
                              rows={2}
                              placeholder="이 상품에 대한 리뷰를 써주세요"
                              value={newReviewText}
                              onChange={e => setNewReviewText(e.target.value)}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => setNewReviewImage(e.target.files?.[0] || null)}
                              className="input-field p-xs text-12 w-fit"
                            />
                          </div>
                          <button
                            onClick={submitReview}
                            className="btn-accent"
                          >
                            등록
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 리뷰 목록 */}
                <div className="p-md flex-col gap-sm">
                  {reviews.length === 0 ? (
                    <div className="text-center text-muted p-lg">등록된 리뷰가 없습니다.</div>
                  ) : (
                    <>
                      {reviews.slice((reviewPage - 1) * reviewsPerPage, reviewPage * reviewsPerPage).map((review: any) => (
                        <div key={review.id} id={`review-${review.id}`} className="p-sm bg-dim rounded-md border-default">
                          <div className="flex-row-between mb-6px">
                            <div className="flex-row gap-xs items-center">
                              <span className="text-14-bold text-primary">{review.author}</span>
                              <span className="text-12 text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="text-13 text-accent mb-6px">{"⭐".repeat(review.rating)}</div>
                          <p className="text-14 text-secondary margin-0 mb-6px" style={{ lineHeight: "1.5" }}>{review.content}</p>
                          {review.has_image && (
                            <div className="mt-xs mb-xs">
                              <img src={`/api/images/reviews/${review.id}`} alt="리뷰 이미지" style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", objectFit: "cover" }} />
                            </div>
                          )}
                        </div>
                      ))}

                      {/* 페이지네이션 */}
                      {reviews.length > reviewsPerPage && (
                        <div className="flex-row gap-xs mt-md justify-center">
                          <button
                            onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                            disabled={reviewPage === 1}
                            className="btn-outline-secondary btn-sm"
                          >
                            이전
                          </button>
                          {[...Array(Math.ceil(reviews.length / reviewsPerPage))].map((_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => setReviewPage(i + 1)}
                              className={`btn-sm ${reviewPage === i + 1 ? "btn-accent" : "btn-outline-secondary"}`}
                              style={{ minWidth: "32px" }}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => setReviewPage(p => Math.min(Math.ceil(reviews.length / reviewsPerPage), p + 1))}
                            disabled={reviewPage === Math.ceil(reviews.length / reviewsPerPage)}
                            className="btn-outline-secondary btn-sm"
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