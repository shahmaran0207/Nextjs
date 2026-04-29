"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Product } from "@/types/shoppingType";
import "../shopping.css";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";

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

  // 젠 모드 상태
  const [isZenMode, setIsZenMode] = useState(false);

  // AR 컬러 체인저 상태
  const [activeHue, setActiveHue] = useState<number>(0);

  // 최애핏 비교기 상태
  const [myFit, setMyFit] = useState<{ waist: number, length: number } | null>(null);
  const [showFitModal, setShowFitModal] = useState(false);
  const [tempWaist, setTempWaist] = useState("");
  const [tempLength, setTempLength] = useState("");

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

  // 구매 이력 기반 상태
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>([]);
  const [hasBoughtThis, setHasBoughtThis] = useState(false);
  const [recommendMessage, setRecommendMessage] = useState<string | null>(null);


  // 리뷰 페이지네이션
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 10;
  const highlightReviewId = searchParams.get('highlightReviewId');

  // 실제 데이터 (반품 통계 - 실제 DB 데이터)
  const [returnRate, setReturnRate] = useState<number>(0);
  const [topReturnReason, setTopReturnReason] = useState<string | null>(null);
  const [returnTotalOrders, setReturnTotalOrders] = useState<number>(0);

  // 최애핏 비교를 위한 상품 가상 실측 사이즈
  const productWaist = product ? 35 + (Number(product.id) % 10) : 40; // 35 ~ 44 cm
  const productLength = product ? 95 + (Number(product.id) % 15) : 100; // 95 ~ 109 cm

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

  const fetchReturnStats = async () => {
    try {
      const res = await fetch(`/api/Shopping/Products/${id}/return-stats`);
      if (res.ok) {
        const data = await res.json();
        setReturnRate(data.returnRate || 0);
        setTopReturnReason(data.topReturnReason || null);
        setReturnTotalOrders(data.totalOrders || 0);
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
      fetchReturnStats();

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

      // 젠 모드 로드
      const savedZenMode = localStorage.getItem("zenMode") === "true";
      setIsZenMode(savedZenMode);

      // 최애핏 로드
      const savedFit = localStorage.getItem("myFavoriteFit");
      if (savedFit) {
        const parsed = JSON.parse(savedFit);
        setMyFit(parsed);
        setTempWaist(String(parsed.waist));
        setTempLength(String(parsed.length));
      }
    }
  }, [id]);

  const saveMyFit = () => {
    if (!tempWaist || !tempLength) return alert("사이즈를 입력해주세요.");
    const data = { waist: Number(tempWaist), length: Number(tempLength) };
    setMyFit(data);
    localStorage.setItem("myFavoriteFit", JSON.stringify(data));
    setShowFitModal(false);
  };

  const toggleZenMode = () => {
    setIsZenMode(prev => {
      const next = !prev;
      localStorage.setItem("zenMode", String(next));
      return next;
    });
  };

  useEffect(() => {
    fetchWishlists();
    if (id) checkCanReview();
  }, [email, id]);



  const checkOrderHistory = async () => {
    if (!email || !product) return;
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        const orders = data.orders || [];
        setPurchaseHistory(orders);

        let alreadyBought = false;
        let boughtItems = new Map<string, string>();

        orders.forEach((order: any) => {
          order.items?.forEach((item: any) => {
            if (Number(item.product_id) === Number(id)) {
              alreadyBought = true;
            }
            const pName = item.product_name?.toLowerCase() || "";
            const oName = item.option_name?.toLowerCase() || "";
            const realName = item.product_name || "";

            if (pName.includes("바지") || pName.includes("팬츠") || pName.includes("슬랙스") || pName.includes("청바지") || oName.includes("팬츠")) {
              if (!boughtItems.has("pants")) boughtItems.set("pants", realName);
            }
            if (pName.includes("셔츠") || pName.includes("티") || pName.includes("맨투맨") || pName.includes("니트") || pName.includes("스웨터")) {
              if (!boughtItems.has("shirt")) boughtItems.set("shirt", realName);
            }
            if (pName.includes("신발") || pName.includes("구두") || pName.includes("운동화") || pName.includes("슬리퍼") || pName.includes("스니커즈")) {
              if (!boughtItems.has("shoes")) boughtItems.set("shoes", realName);
            }
            if (pName.includes("자켓") || pName.includes("패딩") || pName.includes("코트") || pName.includes("점퍼") || pName.includes("후드집업")) {
              if (!boughtItems.has("outer")) boughtItems.set("outer", realName);
            }
            if (pName.includes("볼캡") || pName.includes("모자") || pName.includes("비니")) {
              if (!boughtItems.has("caps")) boughtItems.set("caps", realName);
            }
            if (pName.includes("양말") || pName.includes("삭스")) {
              if (!boughtItems.has("socks")) boughtItems.set("socks", realName);
            }
          });
        });

        setHasBoughtThis(alreadyBought);

        if (!alreadyBought && orders.length > 0) {
          // 1. 현재 상품의 카테고리 유추
          let cat = product.category ? product.category.toLowerCase() : "";
          if (!cat || cat === "etc") {
            const name = product.name.toLowerCase();
            if (name.includes("셔츠") || name.includes("티") || name.includes("맨투맨")) cat = "shirt";
            else if (name.includes("바지") || name.includes("팬츠") || name.includes("슬랙스") || name.includes("청바지")) cat = "pants";
            else if (name.includes("신발") || name.includes("구두") || name.includes("운동화") || name.includes("슬리퍼")) cat = "shoes";
            else if (name.includes("자켓") || name.includes("패딩") || name.includes("코트") || name.includes("점퍼") || name.includes("후드집업")) cat = "outer";
            else if (name.includes("모자") || name.includes("볼캡")) cat = "caps";
            else if (name.includes("양말")) cat = "socks";
          }

          // 2. 스마트 매칭: 현재 카테고리와 과거 구매 내역을 비교
          if (cat) {
            // 과거에 동일한 카테고리를 산 적이 있다면 추천 메시지 생략 (중복 카테고리 방지)
            if (boughtItems.has(cat)) {
              setRecommendMessage(null);
            } else {
              // 가장 최근에 구매한 아이템의 '실제 이름'을 메시지에 삽입
              if (cat === "shirt" && boughtItems.has("pants")) {
                setRecommendMessage(`💡 이전에 구매하신 [${boughtItems.get("pants")}] 제품과 코디하기 완벽한 상의입니다!`);
              } else if (cat === "pants" && boughtItems.has("shirt")) {
                setRecommendMessage(`💡 최근 구매하신 [${boughtItems.get("shirt")}] 제품과 잘 어울리는 하의를 찾고 계셨군요!`);
              } else if (cat === "shoes" && boughtItems.has("pants")) {
                setRecommendMessage(`💡 구매하신 [${boughtItems.get("pants")}]에 찰떡궁합인 신발입니다!`);
              } else if (cat === "shoes" && boughtItems.has("outer")) {
                setRecommendMessage(`💡 구매하신 [${boughtItems.get("outer")}] 스타일을 완성해줄 신발입니다!`);
              } else if (cat === "outer" && boughtItems.has("shirt")) {
                setRecommendMessage(`💡 구매하신 [${boughtItems.get("shirt")}] 위에 걸치기 딱 좋은 아우터입니다!`);
              } else if (cat === "caps" && boughtItems.has("shirt")) {
                setRecommendMessage(`💡 최근 구매하신 [${boughtItems.get("shirt")}]에 포인트를 주기 좋은 모자입니다!`);
              } else if (cat === "caps" && boughtItems.has("outer")) {
                setRecommendMessage(`💡 구매하신 [${boughtItems.get("outer")}]와 함께 매치하기 좋은 모자입니다!`);
              } else if (cat === "socks" && boughtItems.has("shoes")) {
                setRecommendMessage(`💡 최근 구매하신 [${boughtItems.get("shoes")}] 신발과 함께 신기 좋은 양말입니다!`);
              } else {
                // 매칭되지 않은 상품은 추천하지 않음
                setRecommendMessage(null);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkOrderHistory();
  }, [email, product]);

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
      option_name: selectedOption ? selectedOption.option_name : null,
      seller_id: product.seller_id ?? null,  // 암호화폐 결제 라우팅용
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

      <PageHeader
        icon="🛍️"
        title="상품 상세"
        subtitle={product?.name ?? "불러오는 중.."}
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "상품 목록으로" },
        ]}
      >
        <button
          onClick={toggleZenMode}
          title="마케팅 팝업과 화려한 알림을 숨기고 온전히 상품에만 집중하세요."
          className={`zen-btn ${isZenMode ? 'zen-btn--on' : 'zen-btn--off'}`}
        >
          {isZenMode ? "🌿 젠 모드 ON" : "⚡ 일반 모드"}
        </button>
      </PageHeader>

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
                  <button onClick={toggleWishlist} className="btn-wishlist">
                    {isWished ? "❤️" : "🤍"}
                  </button>
                  <div className="product-img-box" style={{ position: "relative" }}>
                    {product.has_image ? (
                      <img
                        src={`/api/images/products/${product.id}`}
                        alt={product.name}
                        className="product-img-full"
                        style={{
                          filter: activeHue === 0 ? "none" : `sepia(0.8) saturate(3) hue-rotate(${activeHue}deg)`,
                          transition: "filter 0.5s ease-in-out"
                        }}
                      />
                    ) : (
                      <div className="product-img-empty">
                        <div className="empty-box-icon">📷</div>
                        <div className="text-12">이미지 없음</div>
                      </div>
                    )}

                    {/* AR 컬러 체인저 UI */}
                    <div className="ar-color-bar">
                      {[
                        { color: "#ffffff", hue: 0, name: "오리지널" },
                        { color: "#ef4444", hue: 320, name: "레드 체인지" },
                        { color: "#10b981", hue: 90, name: "그린 체인지" },
                        { color: "#3b82f6", hue: 180, name: "블루 체인지" },
                        { color: "#a855f7", hue: 230, name: "퍼플 체인지" },
                      ].map((swatch, idx) => (
                        <button
                          key={idx}
                          title={swatch.name}
                          onClick={() => setActiveHue(swatch.hue)}
                          className="color-swatch"
                          style={{
                            background: swatch.color,
                            border: activeHue === swatch.hue ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                            transform: activeHue === swatch.hue ? "scale(1.2)" : "scale(1)",
                            boxShadow: activeHue === swatch.hue ? `0 0 10px ${swatch.color}` : "none"
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="product-info-col">
                    <div>
                      <div className="status-badge-wrapper flex-justify-between items-center mb-xs">
                        <div className="flex-row gap-xs items-center">
                          {!isZenMode && (
                            <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                              {product.is_active ? "판매중" : "판매중단"}
                            </span>
                          )}
                        </div>
                        <span className="text-13-mono text-muted">{product.category || "etc"}</span>
                      </div>

                      <div className="flex-row-between items-start mb-xs">
                        <h2 className="product-title margin-0">{product.name}</h2>
                      </div>

                      <div className="text-14 text-accent mb-1rem">
                        ⭐{product.rating || "0.0"} ({product.reviewCount || 0}개의 리뷰)
                      </div>

                      {/* 구매 이력 기반 경고 및 추천 UI */}
                      {!isZenMode && hasBoughtThis && (
                        <div className="alert-box alert-box--warning">
                          <span className="alert-emoji">⚠️</span>
                          <span className="alert-text--warning">회원님은 이전에 이 상품을 구매한 이력이 있습니다. 중복 구매에 주의하세요!</span>
                        </div>
                      )}

                      {!isZenMode && recommendMessage && !hasBoughtThis && (
                        <div className="alert-box alert-box--info">
                          <span className="alert-emoji">✨</span>
                          <span className="alert-text--info">{recommendMessage}</span>
                        </div>
                      )}

                      <p className="product-desc">{product.description ?? "설명이 없습니다."}</p>

                      {/* 최애핏 비교기 (Fit Migrator) */}
                      {!isZenMode && (
                        <div className="fit-box">
                          <div className="fit-box-header">
                            <h3 className="fit-box-title">
                              🩳 내 최애핏 비교기
                            </h3>
                            <button onClick={() => setShowFitModal(true)} className="fit-register-btn">
                              {myFit ? "내 사이즈 수정" : "내 사이즈 등록"}
                            </button>
                          </div>

                          {!myFit ? (
                            <p className="fit-hint">평소 가장 잘 맞는 바지의 실측 사이즈를 등록하고 이 상품과 비교해보세요!</p>
                          ) : (
                            <div className="fit-bars">
                              <div>
                                <div className="fit-bar-labels">
                                  <span>허리 단면 (상품: {productWaist}cm / 최애핏: {myFit.waist}cm)</span>
                                  <span style={{ color: productWaist > myFit.waist ? "#ef4444" : (productWaist < myFit.waist ? "#10b981" : "var(--color-muted)"), fontWeight: "bold" }}>
                                    {productWaist === myFit.waist ? "사이즈가 동일합니다" : `${Math.abs(productWaist - myFit.waist)}cm ${productWaist > myFit.waist ? "더 큽니다" : "더 작습니다"}`}
                                  </span>
                                </div>
                                <div className="fit-bar-track">
                                  {/* 내 최애핏 기준 마커 (중앙) */}
                                  <div className="fit-bar-marker" />
                                  {/* 상품 사이즈 비교 바 (최대 10cm 차이까지만 시각화) */}
                                  <div className="fit-bar-fill" style={{
                                    left: productWaist > myFit.waist ? "50%" : `calc(50% - ${Math.min(50, Math.abs(myFit.waist - productWaist) * 5)}%)`,
                                    width: `${Math.min(50, Math.abs(productWaist - myFit.waist) * 5)}%`,
                                    background: productWaist > myFit.waist ? "#ef4444" : "#10b981",
                                  }} />
                                </div>
                              </div>
                              <div>
                                <div className="fit-bar-labels">
                                  <span>총기장 (상품: {productLength}cm / 최애핏: {myFit.length}cm)</span>
                                  <span style={{ color: productLength > myFit.length ? "#ef4444" : (productLength < myFit.length ? "#10b981" : "var(--color-muted)"), fontWeight: "bold" }}>
                                    {productLength === myFit.length ? "사이즈가 동일합니다" : `${Math.abs(productLength - myFit.length)}cm ${productLength > myFit.length ? "더 깁니다" : "더 짧습니다"}`}
                                  </span>
                                </div>
                                <div className="fit-bar-track">
                                  <div className="fit-bar-marker" />
                                  <div className="fit-bar-fill" style={{
                                    left: productLength > myFit.length ? "50%" : `calc(50% - ${Math.min(50, Math.abs(myFit.length - productLength) * 2)}%)`,
                                    width: `${Math.min(50, Math.abs(productLength - myFit.length) * 2)}%`,
                                    background: productLength > myFit.length ? "#ef4444" : "#10b981",
                                  }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
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
                <div className="card-container shop-surface border-default product-side-panel" style={{ filter: isZenMode ? "grayscale(100%)" : "none", transition: "all 0.3s" }}>


                  <h3 className="panel-title text-primary mt-sm">결제 정보</h3>
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

                {/* 침묵의 데이터 (Silent Review) */}
                <div className="return-stats-box">
                  <div className="return-stats-header">
                    <h3 className="return-stats-title">
                      📊 침묵의 데이터 (최근 6개월 반품 통계)
                    </h3>
                    <span className="return-stats-badge">
                      투명한 쇼핑 리포트
                    </span>
                  </div>

                  <div className="return-stats-body">
                    <div className="return-rate-col">
                      <div className="return-rate-header">
                        <span className="return-rate-label">평균 반품률</span>
                        <span className="return-rate-value">{returnRate}%</span>
                      </div>
                      <div className="return-rate-track">
                        <div className="return-rate-fill" style={{ width: `${returnRate}%` }} />
                      </div>
                    </div>
                    <div className="return-reason-col">
                      <div className="return-reason-label">가장 많은 반품 사유 (Top 1)</div>
                      <div className="return-reason-value">
                        {topReturnReason ? `"${topReturnReason}"` : returnTotalOrders === 0 ? "반품 데이터 없음" : "반품 사유 미기록"}
                      </div>
                    </div>
                  </div>
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
                          <p className="text-14 text-secondary margin-0 mb-6px review-content">{review.content}</p>
                          {review.has_image && (
                            <div className="mt-xs mb-xs">
                              <img src={`/api/images/reviews/${review.id}`} alt="리뷰 이미지" className="review-img" />
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
                              className={`btn-sm btn-page-num ${reviewPage === i + 1 ? "btn-accent" : "btn-outline-secondary"}`}
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

      {/* 최애핏 등록 모달 */}
      {showFitModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">🩳 내 최애핏 등록</h3>
            <p className="modal-hint">가장 잘 맞는 바지의 실측 사이즈를 입력하세요.</p>

            <div className="modal-fields">
              <div>
                <label className="modal-label">허리 단면 (cm)</label>
                <input type="number" className="input-field w-full" placeholder="예: 38" value={tempWaist} onChange={e => setTempWaist(e.target.value)} />
              </div>
              <div>
                <label className="modal-label">총기장 (cm)</label>
                <input type="number" className="input-field w-full" placeholder="예: 102" value={tempLength} onChange={e => setTempLength(e.target.value)} />
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowFitModal(false)} className="btn-outline-secondary flex-1">취소</button>
              <button onClick={saveMyFit} className="btn-accent flex-1">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}