"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../Shopping/shopping.css";

export default function MyReviewsPage() {
  const { email } = useAuthGuard();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchReviews = async () => {
      if (!email) return;
      try {
        const res = await fetch(`/api/myreviews?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          setReviews(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [email]);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReviews = reviews.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="page-container shop-bg">
      <div className="bg-grid" />
      
      <header className="shopping-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="logo-icon">⭐</div>
          <div>
            <h1 className="header-title text-primary">나의 리뷰</h1>
            <p className="header-subtitle text-accent">내가 작성한 리뷰 모아보기</p>
          </div>
        </div>
        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <Link href="/mypage" className="nav-link">마이페이지</Link>
          <Link href="/Shopping" className="nav-link">쇼핑하러 가기</Link>
        </nav>
      </header>

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          <div className="card-container shop-surface border-default">
            <div className="title-banner border-bottom-default">
              <h2 className="margin-0 text-primary" style={{ fontSize: "18px" }}>작성한 리뷰 ({reviews.length})</h2>
            </div>
            
            <div style={{ padding: "1.5rem" }}>
              {loading ? (
                <div className="text-center text-muted" style={{ padding: "2rem 0" }}>로딩 중...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: "2rem 0" }}>작성한 리뷰가 없습니다.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {currentReviews.map((review) => (
                    <Link key={review.id} href={`/Shopping/${review.product_id}?highlightReviewId=${review.id}`} style={{ textDecoration: "none" }}>
                      <div className="border-default" style={{ padding: "1rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      >
                        {/* 상품 정보 영역 */}
                        {review.product && (
                          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                            <div style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", background: "#333", flexShrink: 0 }}>
                              {review.product.has_image ? (
                                <img src={`/api/images/products/${review.product.id}`} alt={review.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>IMG</div>
                              )}
                            </div>
                            <span className="text-14-bold text-primary">{review.product.name}</span>
                          </div>
                        )}
                        
                        {/* 리뷰 내용 영역 */}
                        <div className="flex-justify-between mb-6px">
                          <div className="text-13 text-accent">{"⭐".repeat(review.rating)}</div>
                          <span className="text-12 text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-14 text-secondary margin-0" style={{ lineHeight: "1.5" }}>{review.content}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* 페이지네이션 UI */}
              {!loading && totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "2rem" }}>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="btn-outline-secondary"
                    style={{ padding: "6px 12px", fontSize: "13px" }}
                  >
                    이전
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={currentPage === i + 1 ? "btn-primary" : "btn-outline-secondary"}
                      style={{ padding: "6px 12px", fontSize: "13px", minWidth: "32px" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="btn-outline-secondary"
                    style={{ padding: "6px 12px", fontSize: "13px" }}
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
