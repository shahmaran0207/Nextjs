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

  // Flash Mob (웹소켓) 상태
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const targetParticipants = 50;
  const [flashMobSuccess, setFlashMobSuccess] = useState(false);

  // 리뷰 페이지네이션
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 10;
  const highlightReviewId = searchParams.get('highlightReviewId');

  // 침묵의 데이터 (반품 통계 - 가상 데이터)
  const returnRate = product ? (Number(product.id) % 12) + 4 : 0;
  const reasonIndex = product ? (Number(product.id) % 4) : 0;
  const returnReasons = ["생각보다 핏이 타이트함", "화면과 색상이 약간 다름", "생각보다 얇은 소재", "배송 지연"];
  const topReturnReason = returnReasons[reasonIndex];

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

  useEffect(() => {
    if (!id) return;
    const socket = new WebSocket('ws://localhost:3000');

    socket.onopen = () => {
      console.log('[WS] Connected to Flash Mob Server');
      socket.send(JSON.stringify({ type: 'join', productId: id }));
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'updateCount') {
        setParticipantCount(data.count);
      } else if (data.type === 'flashMobSuccess') {
        setFlashMobSuccess(true);
        triggerConfetti();
        // 쿠폰 발급 알림은 1번만 띄우기 위해 약간 딜레이 (UI 렌더링 후)
        setTimeout(() => alert('🎉 Flash Mob 목표 인원 달성!\n접속하신 모든 분들께 50% 특별 할인 쿠폰이 발급되었습니다!'), 500);
      }
    };

    socket.onclose = () => {
      console.log('[WS] Disconnected');
    };

    return () => {
      socket.close();
    };
  }, [id]);

  const triggerConfetti = () => {
    import('canvas-confetti').then((module) => {
      const confetti = module.default;
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
      }, 250);
    });
  };

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
          style={{
            backgroundColor: isZenMode ? "#10b981" : "rgba(255, 255, 255, 0.08)",
            color: isZenMode ? "#ffffff" : "#e8eaf0",
            border: isZenMode ? "1px solid #10b981" : "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "20px",
            padding: "6px 14px",
            fontSize: "13px",
            fontWeight: "bold",
            cursor: "pointer",
            transition: "all 0.2s ease-in-out",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: isZenMode ? "0 0 10px rgba(16, 185, 129, 0.4)" : "0 2px 4px rgba(0,0,0,0.2)",
          }}
          onMouseEnter={e => {
            if (!isZenMode) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 255, 255, 0.15)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.4)";
            }
          }}
          onMouseLeave={e => {
            if (!isZenMode) {
              (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255, 255, 255, 0.08)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255, 255, 255, 0.2)";
            }
          }}
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
                  <button onClick={toggleWishlist} style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "40px", height: "40px", fontSize: "20px", cursor: "pointer", zIndex: 10 }}>
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
                    <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "10px", background: "rgba(10, 14, 26, 0.7)", padding: "10px 16px", borderRadius: "30px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
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
                          style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: swatch.color,
                            border: activeHue === swatch.hue ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                            cursor: "pointer",
                            transform: activeHue === swatch.hue ? "scale(1.2)" : "scale(1)",
                            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
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
                        <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "8px", padding: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "18px" }}>⚠️</span>
                          <span style={{ color: "#fca5a5", fontSize: "13px", fontWeight: 600 }}>회원님은 이전에 이 상품을 구매한 이력이 있습니다. 중복 구매에 주의하세요!</span>
                        </div>
                      )}

                      {!isZenMode && recommendMessage && !hasBoughtThis && (
                        <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.3)", borderRadius: "8px", padding: "12px", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "18px" }}>✨</span>
                          <span style={{ color: "#38bdf8", fontSize: "13px", fontWeight: 600 }}>{recommendMessage}</span>
                        </div>
                      )}

                      <p className="product-desc">{product.description ?? "설명이 없습니다."}</p>

                      {/* 최애핏 비교기 (Fit Migrator) */}
                      {!isZenMode && (
                        <div style={{ marginTop: "16px", padding: "16px", background: "rgba(139, 92, 246, 0.05)", borderRadius: "8px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <h3 style={{ margin: 0, fontSize: "14px", color: "#8b5cf6", display: "flex", alignItems: "center", gap: "6px" }}>
                              🩳 내 최애핏 비교기
                            </h3>
                            <button onClick={() => setShowFitModal(true)} style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", cursor: "pointer" }}>
                              {myFit ? "내 사이즈 수정" : "내 사이즈 등록"}
                            </button>
                          </div>

                          {!myFit ? (
                            <p style={{ fontSize: "13px", color: "var(--color-muted)", margin: 0 }}>평소 가장 잘 맞는 바지의 실측 사이즈를 등록하고 이 상품과 비교해보세요!</p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                  <span>허리 단면 (상품: {productWaist}cm / 최애핏: {myFit.waist}cm)</span>
                                  <span style={{ color: productWaist > myFit.waist ? "#ef4444" : (productWaist < myFit.waist ? "#10b981" : "var(--color-muted)"), fontWeight: "bold" }}>
                                    {productWaist === myFit.waist ? "사이즈가 동일합니다" : `${Math.abs(productWaist - myFit.waist)}cm ${productWaist > myFit.waist ? "더 큽니다" : "더 작습니다"}`}
                                  </span>
                                </div>
                                <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", position: "relative" }}>
                                  {/* 내 최애핏 기준 마커 (중앙) */}
                                  <div style={{ position: "absolute", left: "50%", top: "-4px", width: "2px", height: "16px", background: "#8b5cf6", zIndex: 1 }} />
                                  {/* 상품 사이즈 비교 바 (최대 10cm 차이까지만 시각화) */}
                                  <div style={{
                                    position: "absolute",
                                    left: productWaist > myFit.waist ? "50%" : `calc(50% - ${Math.min(50, Math.abs(myFit.waist - productWaist) * 5)}%)`,
                                    width: `${Math.min(50, Math.abs(productWaist - myFit.waist) * 5)}%`,
                                    height: "100%",
                                    background: productWaist > myFit.waist ? "#ef4444" : "#10b981",
                                    borderRadius: "4px"
                                  }} />
                                </div>
                              </div>
                              <div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                  <span>총기장 (상품: {productLength}cm / 최애핏: {myFit.length}cm)</span>
                                  <span style={{ color: productLength > myFit.length ? "#ef4444" : (productLength < myFit.length ? "#10b981" : "var(--color-muted)"), fontWeight: "bold" }}>
                                    {productLength === myFit.length ? "사이즈가 동일합니다" : `${Math.abs(productLength - myFit.length)}cm ${productLength > myFit.length ? "더 깁니다" : "더 짧습니다"}`}
                                  </span>
                                </div>
                                <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.05)", borderRadius: "4px", position: "relative" }}>
                                  <div style={{ position: "absolute", left: "50%", top: "-4px", width: "2px", height: "16px", background: "#8b5cf6", zIndex: 1 }} />
                                  <div style={{
                                    position: "absolute",
                                    left: productLength > myFit.length ? "50%" : `calc(50% - ${Math.min(50, Math.abs(myFit.length - productLength) * 2)}%)`,
                                    width: `${Math.min(50, Math.abs(productLength - myFit.length) * 2)}%`,
                                    height: "100%",
                                    background: productLength > myFit.length ? "#ef4444" : "#10b981",
                                    borderRadius: "4px"
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

                  {/* 플래시몹 진행 상황 바 */}
                  {!isZenMode && (
                    <div style={{ marginBottom: "1rem", padding: "16px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                      <div className="flex-justify-between mb-xs">
                        <span className="text-14-bold" style={{ color: "#fbbf24" }}>🔥 Flash Mob 공동구매</span>
                        <span className="text-13-mono text-accent">{participantCount} / {targetParticipants} 명</span>
                      </div>
                      <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{
                          width: `${Math.min(100, (participantCount / targetParticipants) * 100)}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #f59e0b, #ef4444)",
                          transition: "width 0.5s ease-in-out"
                        }} />
                      </div>
                      <p style={{ fontSize: "12px", color: flashMobSuccess ? "#ef4444" : "#fbbf24", margin: "8px 0 0 0", fontWeight: flashMobSuccess ? "bold" : "normal", lineHeight: 1.4 }}>
                        {flashMobSuccess
                          ? "🎉 목표 인원 달성 완료! 지금 결제하시면 결제 금액의 50%가 포인트로 즉시 페이백됩니다!"
                          : `💡 먼저 결제하셔도 손해 없습니다! ${targetParticipants}명 달성 시, 이미 결제하신 분들을 포함해 참여자 전원에게 결제 금액의 50%를 포인트로 환급(페이백) 해드립니다.`}
                      </p>
                    </div>
                  )}

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
                <div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.05)", borderBottom: "1px solid var(--color-border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ margin: 0, fontSize: "14px", color: "var(--color-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
                      📊 침묵의 데이터 (최근 6개월 반품 통계)
                    </h3>
                    <span style={{ fontSize: "12px", color: "var(--color-muted)", background: "var(--color-surface)", padding: "2px 8px", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
                      투명한 쇼핑 리포트
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "13px", color: "var(--color-secondary)" }}>평균 반품률</span>
                        <span style={{ fontSize: "13px", fontWeight: "bold", color: "#ef4444" }}>{returnRate}%</span>
                      </div>
                      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ width: `${returnRate}%`, height: "100%", background: "#ef4444" }} />
                      </div>
                    </div>
                    <div style={{ flex: 2, background: "var(--color-surface)", padding: "10px", borderRadius: "8px", border: "1px solid var(--color-border)" }}>
                      <div style={{ fontSize: "12px", color: "var(--color-muted)", marginBottom: "4px" }}>가장 많은 반품 사유 (Top 1)</div>
                      <div style={{ fontSize: "14px", color: "var(--color-primary)", fontWeight: 500 }}>"{topReturnReason}"</div>
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

      {/* 최애핏 등록 모달 */}
      {showFitModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--color-surface)", padding: "24px", borderRadius: "16px", width: "320px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "var(--color-primary)" }}>🩳 내 최애핏 등록</h3>
            <p style={{ fontSize: "13px", color: "var(--color-muted)", marginBottom: "20px" }}>가장 잘 맞는 바지의 실측 사이즈를 입력하세요.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "var(--color-secondary)" }}>허리 단면 (cm)</label>
                <input type="number" className="input-field w-full" placeholder="예: 38" value={tempWaist} onChange={e => setTempWaist(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", marginBottom: "4px", color: "var(--color-secondary)" }}>총기장 (cm)</label>
                <input type="number" className="input-field w-full" placeholder="예: 102" value={tempLength} onChange={e => setTempLength(e.target.value)} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => setShowFitModal(false)} className="btn-outline-secondary flex-1">취소</button>
              <button onClick={saveMyFit} className="btn-accent flex-1">저장하기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}