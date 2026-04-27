"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { Product as BaseProduct } from "@/types/shoppingType";
import "../Shopping/shopping.css";
import { PageHeader } from "@/component/PageHeader";

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

  const [flashSaleModal, setFlashSaleModal] = useState<number | null>(null);
  const [flashSalePercent, setFlashSalePercent] = useState(10);
  const [flashSaleEnd, setFlashSaleEnd] = useState("");

  const handleFlashSale = async () => {
    if (!flashSaleModal) return;
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/flash-sales", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify({
          product_id: flashSaleModal,
          discount_percent: flashSalePercent,
          start_time: new Date().toISOString(),
          end_time: new Date(flashSaleEnd).toISOString()
        })
      });
      if (res.ok) {
        alert("플래시 세일이 등록되었습니다.");
        setFlashSaleModal(null);
      } else {
        const d = await res.json();
        alert(d.error || "실패했습니다.");
      }
    } catch (err) { alert("오류가 발생했습니다."); }
  };

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

  const fetchMyProductsForUpdate = async () => {
    try {
      const res = await fetch(`/api/Shopping/MyProducts`);
      if (res.ok) {
        setProducts(await res.json());
      }
    } catch (e) { }
  };

  const deleteProduct = async (productId: number) => {
    if (!confirm("정말 이 상품을 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/Shopping/Products/${productId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        if (data.softDeleted) {
          alert(data.message || "주문 내역이 존재하여 판매 중지(숨김) 처리되었습니다.");
        } else {
          alert("상품이 삭제되었습니다.");
        }
        fetchMyProductsForUpdate();
      } else {
        alert(data.error || "상품 삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

  if (role && role !== "SELLER") {
    return null; // 리다이렉트 중 렌더링 방지
  }

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      <PageHeader
        icon="📦"
        title="나의 등록 상품"
        subtitle="판매자로 등록한 상품 관리"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/mypage", label: "마이페이지" },
          { href: "/Shopping", label: "쇼핑하러 가기" },
        ]}
      />


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
              <div className="flex-row-center gap-12">
                <div className="title-banner-stats badge-accent-dim">
                  <div className="text-22-bold text-accent font-mono">{products.length}</div>
                  <div className="text-11 text-muted mt-2px">총 등록 상품</div>
                </div>
                <button
                  className="btn-accent flex-row items-center gap-xs h-full rounded-lg"
                  onClick={() => router.push("/myproducts/new")}
                >
                  <span className="text-18">+</span> 새 상품 등록
                </button>
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
                    <th className="shopping-th text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr><td colSpan={8} className="empty-table-cell text-muted">등록한 상품이 없습니다.</td></tr>
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
                        <td className="td-cell text-center">
                          <div className="flex-row gap-xs" style={{ justifyContent: "center" }}>
                            <button
                              className="btn-accent btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFlashSaleModal(Number(product.id));
                                setFlashSaleEnd(new Date(Date.now() + 3600000).toISOString().slice(0, 16));
                              }}
                            >
                              🔥 타임딜
                            </button>
                            <button
                              className="btn-outline-secondary btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/myproducts/${product.id}/edit`);
                              }}
                            >
                              수정
                            </button>
                            <button
                              className="btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProduct(Number(product.id));
                              }}
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {flashSaleModal && (
        <div className="modal-overlay">
          <div className="modal-content shop-surface border-default">
            <h3 className="text-primary text-18-bold mb-md">🔥 타임딜 (플래시 세일) 등록</h3>
            <div className="flex-col gap-sm mb-md">
              <div>
                <label className="text-13 text-muted block mb-6px">할인율 (%)</label>
                <input type="number" className="input-field w-full" value={flashSalePercent} onChange={e => setFlashSalePercent(Number(e.target.value))} />
              </div>
              <div>
                <label className="text-13 text-muted block mb-6px">종료 시간</label>
                <input type="datetime-local" className="input-field w-full" value={flashSaleEnd} onChange={e => setFlashSaleEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex-row-between">
              <button className="btn-outline-secondary" onClick={() => setFlashSaleModal(null)}>취소</button>
              <button className="btn-accent" onClick={handleFlashSale}>등록</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
