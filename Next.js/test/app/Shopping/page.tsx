"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { dark } from "../QnA/[id]/component/theme";
import { DarkTheme } from "@/types/shoppingType";
import "./shopping.css";
import { NotificationBell } from "@/component/NotificationBell";

// 확장된 Product 타입 (rating, reviewCount, category 추가됨)
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  sku: string;
  has_image: boolean;
  is_active: boolean;
  category?: string;
  rating?: string;
  reviewCount?: number;
}

export default function ShoppingPage() {
  const { email } = useAuthGuard();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [wishlists, setWishlists] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("latest");
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category && category !== "all") params.append("category", category);
      if (sort) params.append("sort", sort);

      const res = await fetch(`/api/Shopping/Products?${params.toString()}`);
      if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlists = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setWishlists(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort]);

  useEffect(() => {
    fetchWishlists();
  }, [email]);

  // 최근 본 상품 (sessionStorage 기반)
  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem("recently_viewed") || "[]") as number[];
    if (ids.length === 0) return;
    fetch(`/api/Shopping/Products?ids=${ids.join(",")}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        // 평순서를 적역순으로 정렬
        const ordered = ids
          .map(id => (Array.isArray(data) ? data : []).find((p: Product) => Number(p.id) === id))
          .filter(Boolean) as Product[];
        setRecentProducts(ordered);
      })
      .catch(() => {});
  }, []);

  const toggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!email) {
      alert("로그인이 필요합니다.");
      return;
    }
    const isWished = wishlists.includes(productId);

    // Optimistic Update
    setWishlists(prev => isWished ? prev.filter(id => id !== productId) : [...prev, productId]);

    try {
      if (isWished) {
        await fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}&product_id=${productId}`, { method: "DELETE" });
      } else {
        await fetch(`/api/products/wishlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, product_id: productId })
        });
      }
    } catch (err) {
      console.error("위시리스트 업데이트 실패", err);
      fetchWishlists(); // Rollback
    }
  };

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div className="flex-row gap-sm">
          <div className="logo-icon">🛍️</div>
          <div>
            <h1 className="header-title text-primary">Shopping Mall</h1>
            <p className="header-subtitle text-accent">최신 상품을 만나보세요</p>
          </div>
        </div>
        <nav className="flex-row gap-xs" style={{ alignItems: "center" }}>
          <Link href="/" className="nav-link">홈으로</Link>
          <NotificationBell />
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-1100">

          <div className="title-banner shop-surface border-default border-left-accent mb-1rem">
            <div>
              <div className="flex-row-center gap-8 mb-6px">
                <span className="category-badge badge-accent">Shopping</span>
              </div>
              <h2 className="title-banner-heading text-primary margin-0">전체 상품</h2>
              <p className="text-13 text-secondary mt-3px margin-0">상품을 클릭하면 상세 정보를 확인할 수 있습니다.</p>
            </div>
            {!loading && !error && (
              <div className="title-banner-stats badge-accent-dim">
                <div className="text-22-bold text-accent font-mono">{products.length}</div>
                <div className="text-11 text-muted mt-2px">총 상품</div>
              </div>
            )}
          </div>

          {/* 검색 및 필터 바 */}
          <div className="card-container shop-surface border-default mb-sm p-sm flex-row flex-wrap gap-sm items-center">
            <input
              type="text"
              placeholder="상품명 또는 설명 검색..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field flex-1"
            />
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field">
              <option value="all">전체 카테고리</option>
              <option value="shirt">상의 (shirt)</option>
              <option value="shoes">겉옷 (shoes)</option>
              <option value="caps">모자 (caps)</option>
              <option value="outer">겉옷 (outer)</option>
              <option value="socks">양말 (socks)</option>
              <option value="pants">하의 (pants)</option>
              <option value="bag">가방 (bag)</option>
            </select>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field">
              <option value="latest">최신순</option>
              <option value="popular">인기순(별점)</option>
              <option value="price_desc">가격 높은순</option>
              <option value="price_asc">가격 낮은순</option>
            </select>
          </div>

          {loading && (
            <div className="loading-container h-200 text-secondary">
              <div className="spinner" />
              <span className="text-14">상품을 불러오는 중...</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && (
            <div className="card-container shop-surface border-default">
              <table className="shopping-table">
                <thead>
                  <tr className="border-bottom-default">
                    <th className="shopping-th">찜</th>
                    <th className="shopping-th">이미지</th>
                    <th className="shopping-th">카테고리</th>
                    <th className="shopping-th">상품명</th>
                    <th className="shopping-th">가격</th>
                    <th className="shopping-th">별점</th>
                    <th className="shopping-th">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={7} className="empty-table-cell text-muted">등록된 상품이 없습니다.</td></tr>
                  ) : (
                    products.map((product, idx) => {
                      const isWished = wishlists.includes(Number(product.id));
                      return (
                        <tr
                          key={String(product.id)}
                          className={`product-row border-bottom-default ${idx % 2 === 0 ? 'td-cell-even' : 'td-cell-odd'}`}
                          onClick={() => router.push(`/Shopping/${product.id}`)}
                        >
                          <td className="td-cell text-center">
                            <button 
                              className={`wish-btn ${isWished ? 'is-active' : ''}`}
                              onClick={(e) => toggleWishlist(e, Number(product.id))}
                            >
                              {isWished ? "❤️" : "🤍"}
                            </button>
                          </td>
                          <td className="td-cell">
                            {product.has_image ? (
                              <img src={`/api/images/products/${product.id}`} alt={product.name} className="product-img-small border-default" />
                            ) : (
                              <div className="img-placeholder badge-accent-dim border-default">📦</div>
                            )}
                          </td>
                          <td className="td-cell"><span className="text-12 text-muted">{product.category || "etc"}</span></td>
                          <td className="td-cell"><span className="text-14-bold text-primary">{product.name}</span></td>
                          <td className="td-cell"><span className="text-14-money text-green">₩{Number(product.price).toLocaleString()}</span></td>
                          <td className="td-cell"><span className="text-13 text-accent">⭐ {product.rating} ({product.reviewCount})</span></td>
                          <td className="td-cell"><span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>{product.is_active ? "판매중" : "판매중지"}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 최근 본 상품 섹션 */}
          {recentProducts.length > 0 && (
            <div className="mt-1rem">
              <div className="title-banner shop-surface border-default border-left-accent mb-sm" style={{ padding: "0.75rem 1rem" }}>
                <h3 className="margin-0 text-primary text-14-bold">👁️ 최근 본 상품</h3>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {recentProducts.slice(0, 5).map(product => (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/Shopping/${product.id}`)}
                    className="card-container shop-surface border-default"
                    style={{ width: "160px", cursor: "pointer", padding: "12px", flexShrink: 0, transition: "border-color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(56,189,248,0.5)")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "")}
                  >
                    {product.has_image ? (
                      <img src={`/api/images/products/${product.id}`} alt={product.name} style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "6px", marginBottom: "8px" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100px", background: "rgba(56,189,248,0.1)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "8px" }}>📦</div>
                    )}
                    <div className="text-13-bold text-primary" style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{product.name}</div>
                    <div className="text-12-money text-green" style={{ marginTop: "4px" }}>₩{Number(product.price).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
