"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import "../Shopping/shopping.css";
import { PageHeader } from "@/component/PageHeader";

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

  const fetchReviewsForUpdate = async () => {
    if (!email) return;
    try {
      const res = await fetch(`/api/myreviews?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (e) { }
  };

  const deleteReview = async (e: React.MouseEvent, reviewId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!email) return;
    if (!confirm("정말 이 리뷰를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/products/reviews/${reviewId}?email=${encodeURIComponent(email)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("리뷰가 삭제되었습니다.");
        fetchReviewsForUpdate();
      } else {
        alert("리뷰 삭제에 실패했습니다.");
      }
    } catch (err) {
      alert("오류가 발생했습니다.");
    }
  };

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
      <PageHeader
        icon="⭐"
        title="나의 리뷰"
        subtitle="내가 작성한 리뷰 모아보기"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/mypage", label: "마이페이지" },
          { href: "/Shopping", label: "쇼핑하러 가기" },
        ]}
      />

      <main className="page-main">
        <div className="content-wrapper max-w-900">
          <div className="card-container shop-surface border-default">
            <div className="title-banner border-bottom-default">
              <h2 className="margin-0 text-primary text-18">작성한 리뷰 ({reviews.length})</h2>
            </div>

            <div className="p-md">
              {loading ? (
                <div className="text-center text-muted p-lg">로딩 중...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center text-muted p-lg">작성한 리뷰가 없습니다.</div>
              ) : (
                <div className="flex-col gap-sm">
                  {currentReviews.map((review) => (
                    <Link key={review.id} href={`/Shopping/${review.product_id}?highlightReviewId=${review.id}`} className="text-decoration-none">
                      <div className="border-default p-sm rounded-md bg-dim card-hover-effect">
                        {/* 상품 정보 영역 */}
                        {review.product && (
                          <div className="flex-row gap-sm items-center mb-sm pb-sm border-bottom-default">
                            <div className="shrink-0" style={{ width: "40px", height: "40px", borderRadius: "4px", overflow: "hidden", background: "#333" }}>
                              {review.product.has_image ? (
                                <img src={`/api/images/products/${review.product.id}`} alt={review.product.name} className="w-full h-full" style={{ objectFit: "cover" }} />
                              ) : (
                                <div className="w-full h-full flex-row-center text-12">IMG</div>
                              )}
                            </div>
                            <span className="text-14-bold text-primary">{review.product.name}</span>
                          </div>
                        )}

                        {/* 리뷰 내용 영역 */}
                        <div className="flex-row-between mb-6px items-center">
                          <div className="flex-row gap-sm items-center">
                            <div className="text-13 text-accent">{"⭐".repeat(review.rating)}</div>
                            <span className="text-12 text-muted">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                          <button
                            className="btn-danger btn-sm"
                            onClick={(e) => deleteReview(e, review.id)}
                          >
                            삭제
                          </button>
                        </div>
                        <p className="text-14 text-secondary margin-0 line-height-15">{review.content}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* 페이지네이션 UI */}
              {!loading && totalPages > 1 && (
                <div className="flex-row gap-xs mt-lg" style={{ justifyContent: "center" }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-outline-secondary btn-sm"
                  >
                    이전
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`btn-sm ${currentPage === i + 1 ? "btn-accent" : "btn-outline-secondary"}`}
                      style={{ minWidth: "32px" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-outline-secondary btn-sm"
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
