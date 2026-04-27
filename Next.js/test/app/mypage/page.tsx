"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../Shopping/shopping.css";
import { PageHeader } from "@/component/PageHeader";

export default function MyPage() {
  const { email, name, role } = useAuthGuard();

  const getRoleDisplayName = (r: string) => {
    switch (r) {
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

      <PageHeader
        icon="👤"
        title="마이 페이지"
        subtitle="나의 쇼핑 정보"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "쇼핑하러 가기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900">

          {/* 프로필 카드 */}
          <div className="card-container shop-surface border-default mb-2rem">
            <div className="title-banner border-bottom-default">
              <h2 className="margin-0 text-primary text-18">회원 정보</h2>
            </div>
            <div className="p-lg flex-row gap-md items-center">
              <div className="avatar-icon">
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
            <div className="grid-auto-fit">

              {/* 장바구니 카드 */}
              <Link href="/cart" className="text-decoration-none">
                <div className="card-container shop-surface border-default menu-card">
                  <div className="flex-row-between mb-sm">
                    <div style={{ fontSize: "32px" }}>🛒</div>
                    <div className="text-24-bold text-accent">{stats.cartCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">장바구니</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">담아둔 상품들을 확인하세요.</p>
                </div>
              </Link>

              {/* 위시리스트 카드 */}
              <Link href="/wishlists" className="text-decoration-none">
                <div className="card-container shop-surface border-default menu-card">
                  <div className="flex-row-between mb-sm">
                    <div style={{ fontSize: "32px" }}>❤️</div>
                    <div className="text-24-bold text-accent">{stats.wishCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">위시리스트</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">내가 찜한 상품 목록입니다.</p>
                </div>
              </Link>

              {/* 주문내역 카드 */}
              <Link href="/orders" className="text-decoration-none">
                <div className="card-container shop-surface border-default menu-card">
                  <div className="flex-row-between mb-sm">
                    <div style={{ fontSize: "32px" }}>📝</div>
                    <div className="text-24-bold text-accent">{stats.orderCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">주문내역</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">결제 및 배송 상태를 확인하세요.</p>
                </div>
              </Link>

              {/* 게이미피케이션 지갑 카드 (Phase 2 신규) */}
              <Link href="/mypage/wallet" className="text-decoration-none">
                <div className="card-container shop-surface border-default menu-card" style={{ borderColor: '#8b5cf6', background: 'linear-gradient(145deg, rgba(30,41,59,1) 0%, rgba(139,92,246,0.1) 100%)' }}>
                  <div className="flex-row-between mb-sm">
                    <div style={{ fontSize: "32px" }}>🎫</div>
                    <div className="text-24-bold" style={{ color: '#c084fc' }}>MAP</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">맵 쿠폰 지갑</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">트윈맵에서 획득한 쿠폰 및 업적 배지.</p>
                </div>
              </Link>

              {/* 나의 리뷰 카드 */}
              <Link href="/myreviews" className="text-decoration-none">
                <div className="card-container shop-surface border-default menu-card">
                  <div className="flex-row-between mb-sm">
                    <div style={{ fontSize: "32px" }}>⭐</div>
                    <div className="text-24-bold text-accent">{stats.reviewCount}</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">나의 리뷰</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">내가 작성한 리뷰 모아보기</p>
                </div>
              </Link>

              {/* 통계 대시보드 카드 (구매자) */}
              <Link href="/dashboard" className="text-decoration-none">
                <div className="card-container shop-surface border-default menu-card">
                  <div className="flex-row-between mb-sm">
                    <div style={{ fontSize: "32px" }}>📊</div>
                    <div className="text-24-bold text-accent">-</div>
                  </div>
                  <h3 className="text-16-bold text-primary margin-0">나의 쇼핑 통계</h3>
                  <p className="text-13 text-secondary mt-6px margin-0">월별 구매 금액 및 건수를 확인하세요.</p>
                </div>
              </Link>

              {/* 판매자 전용 메뉴 (나의 등록 상품 + 주문/배송 관리) */}
              {role === "SELLER" && (
                <>
                  <Link href="/myproducts" className="text-decoration-none">
                    <div className="card-container shop-surface border-default menu-card">
                      <div className="flex-row-between mb-sm">
                        <div style={{ fontSize: "32px" }}>📦</div>
                        <div className="text-24-bold text-accent">{stats.productCount}</div>
                      </div>
                      <h3 className="text-16-bold text-primary margin-0">나의 등록 상품</h3>
                      <p className="text-13 text-secondary mt-6px margin-0">판매 중인 상품을 관리하세요.</p>
                    </div>
                  </Link>

                  <Link href="/seller/orders" className="text-decoration-none">
                    <div className="card-container shop-surface border-default menu-card">
                      <div className="flex-row-between mb-sm">
                        <div style={{ fontSize: "32px" }}>🚚</div>
                        <div className="text-24-bold text-accent">-</div>
                      </div>
                      <h3 className="text-16-bold text-primary margin-0">주문/배송 관리</h3>
                      <p className="text-13 text-secondary mt-6px margin-0">들어온 주문에 운송장을 등록하세요.</p>
                    </div>
                  </Link>

                  <Link href="/seller/dashboard" className="text-decoration-none">
                    <div className="card-container shop-surface border-default menu-card">
                      <div className="flex-row-between mb-sm">
                        <div style={{ fontSize: "32px" }}>📈</div>
                        <div className="text-24-bold text-accent">-</div>
                      </div>
                      <h3 className="text-16-bold text-primary margin-0">매출 통계</h3>
                      <p className="text-13 text-secondary mt-6px margin-0">월별 매출 및 상품별 판매 건수 그래프.</p>
                    </div>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
