"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Product as BaseProduct } from "@/types/shoppingType";
import "../Shopping/shopping.css";

interface Product extends BaseProduct {
  category?: string;
  rating?: string;
}

export default function MyProductsPage() {
  const { email, role } = useAuthGuard();
  const router = useRouter();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 권한 검사 (AuthGuard가 이메일은 검증해주지만 ROLE은 여기서 체크)
    if (role && role !== "SELLER") {
      alert("판매자만 접근할 수 있는 페이지입니다.");
      router.push("/mypage");
      return;
    }

    const fetchMyProducts = async () => {
      if (!role) return; // role 정보가 아직 로드되지 않은 상태 대기
      try {
        setLoading(true);
        const res = await fetch(`/api/Shopping/MyProducts`);
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) {
            throw new Error("접근 권한이 없습니다.");
          }
          throw new Error("상품 목록을 불러오지 못했습니다.");
        }
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, [role, router]);

  if (role && role !== "SELLER") {
    return null; // 리다이렉트 중 렌더링 방지
  }

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">📦</div>
          <div>
            <h1 className="header-title text-primary">나의 등록 상품</h1>
            <p className="header-subtitle text-accent">판매자로 등록한 상품 관리</p>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/mypage" className="nav-link">마이페이지</Link>
          <Link href="/Shopping" className="nav-link">쇼핑하러 가기</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-1100">
          
          <div className="title-banner shop-surface border-default border-left-accent mb-1rem">
            <div>
              <div className="flex-row-center gap-8 mb-6px">
                <span className="category-badge badge-accent">Seller Menu</span>
              </div>
              <h2 className="title-banner-heading text-primary margin-0">등록 상품 관리</h2>
              <p className="text-13 text-secondary mt-3px margin-0">내가 등록한 상품 목록과 상태를 한눈에 확인하세요.</p>
            </div>
            {!loading && !error && (
              <div className="title-banner-stats badge-accent-dim">
                <div className="text-22-bold text-accent font-mono">{products.length}</div>
                <div className="text-11 text-muted mt-2px">총 등록 상품</div>
              </div>
            )}
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
                    <th className="shopping-th">이미지</th>
                    <th className="shopping-th">카테고리</th>
                    <th className="shopping-th">상품명</th>
                    <th className="shopping-th">가격</th>
                    <th className="shopping-th">재고</th>
                    <th className="shopping-th">별점</th>
                    <th className="shopping-th">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={7} className="empty-table-cell text-muted">등록한 상품이 없습니다.</td></tr>
                  ) : (
                    products.map((product, idx) => (
                      <tr
                        key={String(product.id)}
                        className={`product-row border-bottom-default ${idx % 2 === 0 ? 'td-cell-even' : 'td-cell-odd'}`}
                        onClick={() => router.push(`/Shopping/${product.id}`)}
                      >
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
                        <td className="td-cell"><span className="text-14 text-secondary">{Number(product.stock).toLocaleString()}개</span></td>
                        <td className="td-cell"><span className="text-13 text-accent">⭐ {product.rating}</span></td>
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
