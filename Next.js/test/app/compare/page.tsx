"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/component/PageHeader";
import "../Shopping/shopping.css";

export default function ComparePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const ids = JSON.parse(sessionStorage.getItem("compare_ids") || "[]") as number[];
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/Shopping/Products?ids=${ids.join(",")}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        setProducts(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const removeCompare = (id: number) => {
    const newIds = products.filter(p => p.id !== id).map(p => Number(p.id));
    sessionStorage.setItem("compare_ids", JSON.stringify(newIds));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="⚖️"
        title="상품 비교"
        subtitle="선택한 상품들을 한눈에 비교하세요"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/Shopping", label: "쇼핑하러 가기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-1100">
          {loading ? (
            <div className="loading-container h-200"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="card-container shop-surface border-default text-center p-lg text-muted">
              비교할 상품이 없습니다. 쇼핑 목록에서 상품을 추가해보세요.
            </div>
          ) : (
            <div className="card-container shop-surface border-default" style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                <thead>
                  <tr className="border-bottom-default">
                    <th className="p-sm text-14 text-muted" style={{ width: "120px" }}>비교 항목</th>
                    {products.map(p => (
                      <th key={p.id} className="p-sm" style={{ minWidth: "200px" }}>
                        <div className="flex-row-between items-start">
                          <span />
                          <button onClick={() => removeCompare(p.id)} className="text-muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>×</button>
                        </div>
                        {p.has_image ? (
                          <img src={`/api/images/products/${p.id}`} alt={p.name} style={{ width: "120px", height: "120px", objectFit: "cover", borderRadius: "8px", margin: "0 auto 8px" }} />
                        ) : (
                          <div style={{ width: "120px", height: "120px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>📦</div>
                        )}
                        <div className="text-14-bold text-primary">{p.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-bottom-default">
                    <td className="p-sm text-13 text-muted border-right-default bg-dim">가격</td>
                    {products.map(p => (
                      <td key={p.id} className="p-sm text-18-bold text-green">₩{Number(p.price).toLocaleString()}</td>
                    ))}
                  </tr>
                  <tr className="border-bottom-default">
                    <td className="p-sm text-13 text-muted border-right-default bg-dim">별점/리뷰</td>
                    {products.map(p => (
                      <td key={p.id} className="p-sm text-13 text-accent">⭐ {p.rating} ({p.reviewCount})</td>
                    ))}
                  </tr>
                  <tr className="border-bottom-default">
                    <td className="p-sm text-13 text-muted border-right-default bg-dim">카테고리</td>
                    {products.map(p => (
                      <td key={p.id} className="p-sm text-13-mono text-secondary">{p.category || "etc"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-sm text-13 text-muted border-right-default bg-dim">이동</td>
                    {products.map(p => (
                      <td key={p.id} className="p-sm">
                        <button onClick={() => router.push(`/Shopping/${p.id}`)} className="btn-accent btn-sm">상세보기</button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
