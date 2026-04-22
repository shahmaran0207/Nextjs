"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useNoramlPost from "../hook/useNormalPost";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";

const PostList = () => {

  useAuthGuard();

  const { getList, posts } = useNoramlPost();

  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 5;
  const totalPages = Math.ceil(posts.length / itemPerPage);
  const pagedPosts = posts.slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage);

  useEffect(() => {
    getList();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", flexDirection: "column" }}>
      <PageHeader
        icon="📝"
        title="게시판"
        subtitle="커뮤니티 게시글"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/write", label: "✏️ 글쓰기" },
        ]}
      />

      <main style={{ flex: 1, padding: "2rem 1rem", overflow: "auto" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          {posts.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "4rem",
              color: "#8b90a7", fontSize: "15px",
              background: "#1a1d27", borderRadius: "16px",
              border: "1px dashed rgba(56,189,248,0.15)",
            }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>📄</div>
              아직 작성된 글이 없어요
            </div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {pagedPosts.map((post: any) => (
                  <div
                    key={post.id}
                    onClick={() => router.push(`list/${post.id}`)}
                    style={{
                      background: "#1a1d27",
                      borderRadius: "14px",
                      padding: "1.25rem 1.5rem",
                      border: "1px solid rgba(56,189,248,0.15)",
                      borderLeft: "4px solid #38bdf8",
                      cursor: "pointer",
                      transition: "background 0.15s, transform 0.15s",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = "#22263a";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = "#1a1d27";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "rgba(56,189,248,0.1)", color: "#38bdf8", fontWeight: 500 }}>
                        게시글
                      </span>
                      <span style={{ fontSize: "12px", color: "#8b90a7" }}>
                        {new Date(post.createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                      {post.writer && (
                        <span style={{ fontSize: "12px", color: "#8b90a7" }}>✍ {post.writer}</span>
                      )}
                    </div>
                    <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#e8eaf0", margin: "0 0 6px" }}>
                      {post.title}
                    </h2>
                    <p style={{
                      fontSize: "13px", color: "#8b90a7", margin: 0, lineHeight: "1.6",
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {post.content}
                    </p>
                    {(post.postview !== undefined || post.likecount !== undefined) && (
                      <div style={{ display: "flex", gap: "12px", marginTop: "10px", fontSize: "12px", color: "#8b90a7" }}>
                        {post.postview !== undefined && <span>👁 {post.postview}</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "1.5rem" }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 12px", borderRadius: "8px",
                      border: "1px solid rgba(56,189,248,0.15)", background: "#1a1d27",
                      color: currentPage === 1 ? "#8b90a7" : "#e8eaf0",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px",
                      transition: "all 0.15s",
                    }}
                  >
                    이전
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={{
                        padding: "6px 12px", borderRadius: "8px",
                        border: `1px solid ${currentPage === page ? "#38bdf8" : "rgba(56,189,248,0.15)"}`,
                        background: currentPage === page ? "#38bdf8" : "#1a1d27",
                        color: currentPage === page ? "#0a0e1a" : "#8b90a7",
                        cursor: "pointer", fontSize: "13px",
                        fontWeight: currentPage === page ? 600 : 400,
                        transition: "all 0.15s",
                      }}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 12px", borderRadius: "8px",
                      border: "1px solid rgba(56,189,248,0.15)", background: "#1a1d27",
                      color: currentPage === totalPages ? "#8b90a7" : "#e8eaf0",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px",
                      transition: "all 0.15s",
                    }}
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default PostList;
