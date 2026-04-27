"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Product } from "@/types/shoppingType";
import "../Shopping/shopping.css";
import { PageHeader } from "@/component/PageHeader";

export default function WishlistsPage() {
  const { email } = useAuthGuard();
  const router = useRouter();

  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWishlists = async () => {
      if (!email) return;
      try {
        setLoading(true);
        // 위시리스트의 상품 ID 가져오기
        const wishRes = await fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}`);
        if (!wishRes.ok) throw new Error("위시리스트를 불러오지 못했습니다.");
        const wishIds: number[] = await wishRes.json();

        if (wishIds.length === 0) {
          setWishlistProducts([]);
          setLoading(false);
          return;
        }

        // 전체 상품 중 위시리스트 ID에 해당하는 것만 필터링 (최적화를 위해 전체 목록을 캐시하거나, 백엔드에서 쿼리하는 방식이 좋으나 여기서는 클라이언트에서 필터링)
        const prodRes = await fetch(`/api/Shopping/Products`);
        if (!prodRes.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
        const allProducts: Product[] = await prodRes.json();

        const filtered = allProducts.filter(p => wishIds.includes(Number(p.id)));
        setWishlistProducts(filtered);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlists();
  }, [email]);

  const removeWishlist = async (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    if (!email) return;

    // Optimistic Update
    setWishlistProducts(prev => prev.filter(p => Number(p.id) !== productId));

    try {
      await fetch(`/api/products/wishlist?email=${encodeURIComponent(email)}&product_id=${productId}`, { method: "DELETE" });
    } catch (err) {
      console.error("위시리스트 삭제 실패", err);
      // 에러 발생 시 원래 상태로 복구하는 로직 추가 가능
    }
  };

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="❤️"
        title="위시리스트"
        subtitle="찜한 상품 목록"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "쇼핑 계속하기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-1100">

          <div className="title-banner shop-surface border-default border-left-accent mb-1rem">
            <div>
              <div className="flex-row-center gap-8 mb-6px">
                <span className="category-badge badge-accent">Wishlists</span>
              </div>
              <h2 className="title-banner-heading text-primary margin-0">나의 찜 목록</h2>
              <p className="text-13 text-secondary mt-3px margin-0">내가 찜한 상품들을 모아보세요.</p>
            </div>
            {!loading && !error && (
              <div className="title-banner-stats badge-accent-dim">
                <div className="text-22-bold text-accent font-mono">{wishlistProducts.length}</div>
                <div className="text-11 text-muted mt-2px">총 찜한 상품</div>
              </div>
            )}
          </div>

          {loading && (
            <div className="loading-container h-200 text-secondary">
              <div className="spinner" />
              <span className="text-14">위시리스트를 불러오는 중...</span>
            </div>
          )}

          {error && <div className="error-container">⚠️ {error}</div>}

          {!loading && !error && (
            <div className="card-container shop-surface border-default">
              <table className="shopping-table">
                <thead>
                  <tr className="border-bottom-default">
                    <th className="shopping-th">삭제</th>
                    <th className="shopping-th">이미지</th>
                    <th className="shopping-th">상품명</th>
                    <th className="shopping-th">가격</th>
                    <th className="shopping-th">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {wishlistProducts.length === 0 ? (
                    <tr><td colSpan={5} className="empty-table-cell text-muted">찜한 상품이 없습니다.</td></tr>
                  ) : (
                    wishlistProducts.map((product, idx) => (
                      <tr
                        key={String(product.id)}
                        className={`product-row border-bottom-default ${idx % 2 === 0 ? 'td-cell-even' : 'td-cell-odd'}`}
                        onClick={() => router.push(`/Shopping/${product.id}`)}
                      >
                        <td className="td-cell text-center" onClick={(e) => removeWishlist(e, Number(product.id))}>
                          <button className="wish-btn">
                            ✖
                          </button>
                        </td>
                        <td className="td-cell">
                          {product.has_image ? (
                            <img src={`/api/images/products/${product.id}`} alt={product.name} className="product-img-small border-default" />
                          ) : (
                            <div className="img-placeholder badge-accent-dim border-default">📦</div>
                          )}
                        </td>
                        <td className="td-cell"><span className="text-14-bold text-primary">{product.name}</span></td>
                        <td className="td-cell"><span className="text-14-money text-green">₩{Number(product.price).toLocaleString()}</span></td>
                        <td className="td-cell"><span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>{product.is_active ? "판매중" : "판매중지"}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
