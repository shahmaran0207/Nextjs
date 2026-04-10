"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const dark = {
  bg: "#0f1117",
  surface: "#1a1d27",
  surface2: "#22263a",
  border: "#2e3247",
  textPrimary: "#e8eaf0",
  textSecondary: "#8b90a7",
  textMuted: "#545874",
  accent: "#7c6af7",
  accentDim: "#2d2850",
  blue: "#60a5fa",
  blueDim: "#0d1f3c",
};

const PostList = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 5;
  const totalPages = Math.ceil(posts.length / itemPerPage);
  const pagedPosts = posts.slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage);

  useEffect(() => {
    const getList = async () => {
      try {
        const res = await fetch('/api/posts/getPostList');
        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        console.log("error::::::::::::", err);
      }
    };
    getList();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: dark.bg, padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "12px", color: dark.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
            게시글
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: dark.textPrimary, margin: 0 }}>
            목록
          </h1>
        </div>

        {posts.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "4rem",
            color: dark.textMuted, fontSize: "15px",
            background: dark.surface, borderRadius: "16px",
            border: `1px dashed ${dark.border}`,
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
                    background: dark.surface,
                    borderRadius: "14px",
                    padding: "1.25rem 1.5rem",
                    border: `1px solid ${dark.border}`,
                    borderLeft: `4px solid ${dark.accent}`,
                    cursor: "pointer",
                    transition: "background 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = dark.surface2;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = dark.surface;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: dark.accentDim, color: "#a78bfa", fontWeight: 500 }}>
                      게시글
                    </span>
                    <span style={{ fontSize: "12px", color: dark.textMuted }}>
                      {new Date(post.createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                    {post.writer && (
                      <span style={{ fontSize: "12px", color: dark.textMuted }}>✍ {post.writer}</span>
                    )}
                  </div>
                  <h2 style={{ fontSize: "16px", fontWeight: 600, color: dark.textPrimary, margin: "0 0 6px" }}>
                    {post.title}
                  </h2>
                  <p style={{
                    fontSize: "13px", color: dark.textSecondary, margin: 0, lineHeight: "1.6",
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {post.content}
                  </p>
                  {(post.postview !== undefined || post.likecount !== undefined) && (
                    <div style={{ display: "flex", gap: "12px", marginTop: "10px", fontSize: "12px", color: dark.textMuted }}>
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
                    border: `1px solid ${dark.border}`, background: dark.surface,
                    color: currentPage === 1 ? dark.textMuted : dark.textPrimary,
                    cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px",
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
                      border: `1px solid ${currentPage === page ? dark.accent : dark.border}`,
                      background: currentPage === page ? dark.accent : dark.surface,
                      color: currentPage === page ? "#fff" : dark.textSecondary,
                      cursor: "pointer", fontSize: "13px",
                      fontWeight: currentPage === page ? 600 : 400,
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
                    border: `1px solid ${dark.border}`, background: dark.surface,
                    color: currentPage === totalPages ? dark.textMuted : dark.textPrimary,
                    cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px",
                  }}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PostList;
