"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import Image from "next/image";
import { usePostState } from "@/app/hook/usePostState";
import postStyle from "@/app/hook/postStyle";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";

export default function EditForm({ params }: { params: Promise<{ id: string }> }) {
  useAuthGuard();

  const { id } = use(params);

  const [post, setPost] = useState<any>(null);
  const [postId, setPostId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const router = useRouter();

  const { dark, inputStyle, labelStyle } = postStyle();

  const { handleImageChange, imageFile, setImageFile, previewImage } = usePostState(id);

  useEffect(() => {
    const fetchPost = async () => {
      const { id } = await params;
      setPostId(id);
      const res = await fetch(`/api/posts/getPostList/${id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      setPost(data);
    };
    fetchPost();
  }, []);

  if (!post) return (
    <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", alignItems: "center", justifyContent: "center", color: dark.textMuted, fontSize: "15px" }}>
      로딩 중...
    </div>
  );

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", title || post.title);
    formData.append("content", content || post.content);
    if (imageFile) formData.append("image", imageFile);

    const submit = await fetch(`/api/posts/updatePost/${postId}`, {
      method: "POST",
      credentials: 'include',
      body: formData
    });
    if (submit.status === 200) {
      alert("수정되었습니다.");
      router.push("/list");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
      <PageHeader
        icon="✏️"
        title="게시글 수정"
        subtitle="게시글을 수정합니다"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/list", label: "게시판" },
        ]}
      />

      <div style={{ flex: 1, padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "12px", color: dark.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              게시글
            </p>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: dark.textPrimary, margin: 0 }}>
              수정하기
            </h1>
          </div>

          <div style={{ background: dark.surface, borderRadius: "16px", border: `1px solid ${dark.border}`, overflow: "hidden" }}>
            <div style={{ height: "4px", background: `linear-gradient(90deg, ${dark.accent}, #0ea5e9)` }} />
            <div style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              {/* 제목 */}
              <div>
                <label style={labelStyle}>제목</label>
                <input
                  type="text"
                  placeholder={post.title}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = dark.accent}
                  onBlur={e => e.target.style.borderColor = dark.border}
                />
              </div>

              {/* 내용 */}
              <div>
                <label style={labelStyle}>내용</label>
                <textarea
                  placeholder={post.content}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={10}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
                  onFocus={e => e.target.style.borderColor = dark.accent}
                  onBlur={e => e.target.style.borderColor = dark.border}
                />
              </div>

              {/* 이미지 */}
              <div>
                <label style={labelStyle}>이미지</label>
                <div style={{ width: "100%", height: "240px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${dark.border}`, position: "relative", background: dark.surface2 }}>
                  {previewImage || post.image ? (
                    <Image
                      src={previewImage ?? `data:image/jpeg;base64,${post.image}`}
                      alt="preview"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", color: dark.textMuted }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <p style={{ fontSize: "13px" }}>사진 없음</p>
                    </div>
                  )}
                  <label style={{
                    position: "absolute", inset: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.45)", opacity: 0, transition: "opacity 0.2s", cursor: "pointer",
                  }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
                  >
                    <span style={{ color: "#fff", fontSize: "13px", fontWeight: 500, background: "rgba(0,0,0,0.5)", padding: "6px 16px", borderRadius: "20px" }}>
                      사진 변경
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              {/* 버튼 */}
              <div style={{ display: "flex", gap: "10px", borderTop: `1px solid ${dark.border}`, paddingTop: "1.5rem" }}>
                <button
                  onClick={() => history.back()}
                  style={{
                    flex: 1, padding: "10px", fontSize: "13px", borderRadius: "8px",
                    border: `1px solid ${dark.border}`, background: "transparent",
                    color: dark.textSecondary, cursor: "pointer",
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 1, padding: "10px", fontSize: "13px", fontWeight: 600,
                    borderRadius: "8px", border: "none",
                    background: dark.accent, color: "#fff", cursor: "pointer",
                  }}
                >
                  저장
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
