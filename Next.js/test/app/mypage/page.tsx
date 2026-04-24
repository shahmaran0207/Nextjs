"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../Shopping/shopping.css";

export default function MyPage() {
  const { email, name, role } = useAuthGuard();
  
  const getRoleDisplayName = (r: string) => {
    switch(r) {
      case "ADMIN": return "관리자";
      case "SELLER": return "판매자";
      default: return "일반회원";
    }
  };
  
  const [stats, setStats] = useState({
    cartCount: 0,
    wishCount: 0,
    orderCount: 0,
    reviewCount: 0,
    productCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!email) return;
      try {
        const [cartRes, wishRes, orderRes, reviewRes, productRes] = await Promise.all([
          fetch(`/api/cart/items?email=${encodeURIComponent(email)}`),
          fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}`),
          fetch(`/api/orders?email=${encodeURIComponent(email)}`),
          fetch(`/api/myreviews?email=${encodeURIComponent(email)}`),
          role === "SELLER" 
            ? fetch(`/api/Shopping/MyProducts`) 
            : Promise.resolve(null)
        ]);

        const cartData = cartRes.ok ? await cartRes.json() : { items: [] };
        const wishData = wishRes.ok ? await wishRes.json() : [];
        const orderData = orderRes.ok ? await orderRes.json() : { orders: [] };
        const reviewData = reviewRes.ok ? await reviewRes.json() : [];
        const productData = productRes && productRes.ok ? await productRes.json() : [];

        setStats({
          cartCount: cartData.items?.length || 0,
          wishCount: wishData.length || 0,
          orderCount: orderData.orders?.length || 0,
          reviewCount: reviewData.length || 0,
          productCount: Array.isArray(productData) ? productData.length : 0,
        });
      } catch (error) {
        console.error("통계 불러오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [email, role]);

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">👤</div>
          <div>
            <h1 className="header-title text-primary">마이페이지</h1>
            <p className="header-subtitle text-accent">나의 쇼핑 정보</p>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/Shopping" className="nav-link">쇼핑하러 가기</Link>
          <Link href="/" className="nav-link">홈으로</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          
          {/* 프로필 카드 */}
          <div className="card-container shop-surface border-default mb-2rem">
            <div className="title-banner border-bottom-default">
              <h2 className="margin-0 text-primary" style={{ fontSize: "18px" }}>회원 정보</h2>
            </div>
            <div style={{ padding: "2rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "bold" }}>
                {name ? name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h3 className="text-22-bold text-primary margin-0 mb-6px">{name || "이름 없음"}</h3>
                <p className="text-14 text-secondary margin-0">{email || "이메일 없음"}</p>
                <div className="mt-1rem">
                  <span className="badge-accent">{getRoleDisplayName(role)}</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-18-bold text-primary mb-1rem">나의 쇼핑 활동</h2>
          
          {loading ? (
            <div className="loading-container h-200 text-secondary">
              <div className="spinner" />
              <span className="text-14">정보를 불러오는 중...</span>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
              
              {/* 장바구니 카드 */}
              <Link href="/cart" style={{ textDecoration: "none" }}>
                <div className="card-container shop-surface border-default" style={{ padding: "1.5rem", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", height: "100%" }} 
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "32px" }}>🛒</div>
                    <div className="text-24-bold text-accent">{stats.cartCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">장바구니</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">담아둔 상품들을 확인하세요.</p>
                </div>
              </Link>

              {/* 위시리스트 카드 */}
              <Link href="/wishlists" style={{ textDecoration: "none" }}>
                <div className="card-container shop-surface border-default" style={{ padding: "1.5rem", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", height: "100%" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "32px" }}>❤️</div>
                    <div className="text-24-bold text-accent">{stats.wishCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">위시리스트</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">내가 찜한 상품 목록입니다.</p>
                </div>
              </Link>

              {/* 주문내역 카드 */}
              <Link href="/orders" style={{ textDecoration: "none" }}>
                <div className="card-container shop-surface border-default" style={{ padding: "1.5rem", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", height: "100%" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "32px" }}>📝</div>
                    <div className="text-24-bold text-accent">{stats.orderCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">주문내역</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">결제 및 배송 상태를 확인하세요.</p>
                </div>
              </Link>

              {/* 나의 리뷰 카드 */}
              <Link href="/myreviews" style={{ textDecoration: "none" }}>
                <div className="card-container shop-surface border-default" style={{ padding: "1.5rem", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", height: "100%" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <div style={{ fontSize: "32px" }}>⭐</div>
                    <div className="text-24-bold text-accent">{stats.reviewCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">나의 리뷰</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">내가 작성한 리뷰 모아보기</p>
                </div>
              </Link>

              {/* 나의 등록 상품 관리 카드 (판매자 전용) */}
              {role === "SELLER" && (
                <Link href="/myproducts" style={{ textDecoration: "none" }}>
                  <div className="card-container shop-surface border-default" style={{ padding: "1.5rem", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer", height: "100%" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ fontSize: "32px" }}>📦</div>
                      <div className="text-24-bold text-accent">{stats.productCount}</div>
                    </div>
                    <h3 className="text-16-bold text-primary margin-0">나의 등록 상품</h3>
                    <p className="text-13 text-secondary mt-6px margin-0">판매 중인 상품을 관리하세요.</p>
                  </div>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
