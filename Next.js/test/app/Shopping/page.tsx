"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dark } from "../QnA/[id]/component/theme";
import { Product } from "@/types/shoppingType";
import { DarkTheme } from "@/types/shoppingType";
import "./shopping.css";

/* ─── 컴포넌트 ───────────────────────────────────────── */
export default function ShoppingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/Shopping/Products");
        if (!res.ok) throw new Error("상품 목록을 불러오지 못했습니다.");
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="page-container shop-bg">

      {/* 배경 그리드 */}
      <div className="bg-grid" />

      {/* 헤더 */}
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">
            🛒
          </div>
          <div>
            <h1 className="header-title text-primary">
              쇼핑몰
            </h1>
            <p className="header-subtitle text-accent">
              상품 목록
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/" className="nav-link">
            홈으로
          </Link>
        </nav>
      </header>

      {/* 본문 */}
      <main className="page-main">
        <div className="content-wrapper max-w-1100">

          {/* 타이틀 배너 */}
          <div className="title-banner shop-surface border-default border-left-accent">
            <div>
              <div className="flex-row-center gap-8 mb-6px">
                <span className="category-badge badge-accent">
                  Shopping
                </span>
              </div>
              <h2 className="title-banner-heading text-primary margin-0">
                전체 상품
              </h2>
              <p className="text-13 text-secondary mt-3px margin-0">
                상품을 클릭하면 상세 정보를 확인할 수 있습니다.
              </p>
            </div>
            {!loading && !error && (
              <div className="title-banner-stats badge-accent-dim">
                <div className="text-22-bold text-accent font-mono">
                  {products.length}
                </div>
                <div className="text-11 text-muted mt-2px">총 상품</div>
              </div>
            )}
          </div>

          {/* 로딩 */}
          {loading && (
            <div className="loading-container h-200 text-secondary">
              <div className="spinner" />
              <span className="text-14">상품을 불러오는 중...</span>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="error-container">
              ⚠️ {error}
            </div>
          )}

          {/* 상품 테이블 */}
          {!loading && !error && (
            <div className="card-container shop-surface border-default">
              <table className="shopping-table">
                <thead>
                  <tr className="border-bottom-default">
                    {["이미지", "상품명", "설명", "가격", "재고", "SKU", "상태"].map((th) => (
                      <th key={th} className="shopping-th">
                        {th}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-table-cell text-muted">
                        등록된 상품이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => (
                      <ProductRow key={String(product.id)} product={product} idx={idx} dark={dark} />
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

/* ─── 행 컴포넌트 ─────────────────────────────────────── */
function ProductRow({ product, idx, dark }: { product: Product; idx: number; dark: DarkTheme }) {
  const isEven = idx % 2 === 0;

  return (
    <tr
      className="product-row border-bottom-default"
      onClick={() => { window.location.href = `/Shopping/${product.id}`; }}
    >
      {/* 이미지 */}
      <td className={`td-cell ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="product-img-small border-default"
          />
        ) : (
          <div className="img-placeholder badge-accent-dim border-default">
            📦
          </div>
        )}
      </td>

      {/* 상품명 */}
      <td className={`td-cell ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        <span className="text-14-bold text-primary">{product.name}</span>
      </td>

      {/* 설명 */}
      <td className={`td-cell max-w-280 ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        <span className="text-13 text-ellipsis text-secondary">
          {product.description ?? "-"}
        </span>
      </td>

      {/* 가격 */}
      <td className={`td-cell whitespace-nowrap ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        <span className="text-14-money text-green">
          ₩{Number(product.price).toLocaleString()}
        </span>
      </td>

      {/* 재고 */}
      <td className={`td-cell ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        <span className={`text-13-mono ${product.stock > 0 ? 'text-primary' : 'text-red'}`}>
          {product.stock.toLocaleString()}
        </span>
      </td>

      {/* SKU */}
      <td className={`td-cell ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        <span className="text-12 text-muted font-mono">
          {product.sku ?? "-"}
        </span>
      </td>

      {/* 상태 */}
      <td className={`td-cell ${isEven ? 'td-cell-even' : 'td-cell-odd'}`}>
        <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
          {product.is_active ? "판매중" : "판매중지"}
        </span>
      </td>
    </tr>
  );
}
