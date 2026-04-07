"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PostList = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();
  const [currentpage, setCurrentPage] = useState(1);
  const itemPerPage = 5;
  const totalPages = Math.ceil(posts.length/itemPerPage);
  const pagedPosts = posts.slice((currentpage -1)*itemPerPage, currentpage*itemPerPage)

  useEffect(() => {
    const getList = async () => {
      try {
        const res = await fetch('/api/getPostList');
        const data = await res.json();
        console.log("res:::::::::::::::::", res)
        setPosts(data);
      } catch (err: any) {
        console.log("error::::::::::::", err);
      }
    };
    getList();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4ff",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
      }}>
        <div style={{ marginBottom: "2rem" }}>
          <p style={{
            fontSize: "13px",
            color: "#adb5bd",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "4px",
          }}>게시글</p>
          <h1 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#3b5bdb",
            margin: 0,
          }}>목록</h1>
        </div>

        {posts.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "4rem",
            color: "#adb5bd",
            fontSize: "15px",
            background: "#ffffff",
            borderRadius: "16px",
            border: "1px dashed #dee2e6",
          }}>
            아직 작성된 글이 없어요
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {pagedPosts.map((post: any) => (
                <div
                  key={post.ID}
                  onClick={() => router.push(`list/${post.ID}`)}
                  style={{
                    background: "#ffffff",
                    borderRadius: "16px",
                    padding: "1.5rem 2rem",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    borderLeft: "4px solid #74c0fc",
                    cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                  onMouseOver={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseOut={e => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <h2 style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#212529",
                    margin: "0 0 8px",
                  }}>
                    {post.TITLE}
                  </h2>
                  <p style={{
                    fontSize: "14px",
                    color: "#868e96",
                    margin: "0 0 12px",
                    lineHeight: "1.6",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {post.CONTENT}
                  </p>
                  <small style={{
                    fontSize: "12px",
                    color: "#ced4da",
                  }}>
                    {new Date(post.CREATEDAT).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </small>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentpage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                  background: currentpage === 1 ? "#f5f5f5" : "#fff",
                  color: currentpage === 1 ? "#ccc" : "#333",
                  cursor: currentpage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                }}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e0e0e0",
                    background: currentpage === page ? "#3b82f6" : "#fff",
                    color: currentpage === page ? "#fff" : "#333",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: currentpage === page ? 600 : 400,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentpage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                  background: currentpage === totalPages ? "#f5f5f5" : "#fff",
                  color: currentpage === totalPages ? "#ccc" : "#333",
                  cursor: currentpage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "13px",
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