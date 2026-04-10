"use client"

import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

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
};

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!confirm("저장하시겠습니까?")) return;
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);
      await fetch("/api/posts/addPost", { method: "POST", body: formData });
      setTitle(""); setContent(""); setImage(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    fontSize: "14px",
    border: `1.5px solid ${dark.border}`,
    borderRadius: "10px",
    background: dark.surface2,
    color: dark.textPrimary,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: dark.textMuted,
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  return (
    <div style={{ minHeight: "100vh", background: dark.bg, padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: "12px", color: dark.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
            게시글
          </p>
          <h1 style={{ fontSize: "24px", fontWeight: 600, color: dark.textPrimary, margin: 0 }}>
            글 작성하기
          </h1>
        </div>

        {/* 폼 카드 */}
        <div style={{
          background: dark.surface,
          borderRadius: "16px",
          border: `1px solid ${dark.border}`,
          overflow: "hidden",
        }}>
          <div style={{ height: "4px", background: `linear-gradient(90deg, ${dark.accent}, #a78bfa)` }} />
          <div style={{ padding: "2rem" }}>
            <form onSubmit={handleSubmit}>

              <div style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="title" style={labelStyle}>제목</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = dark.accent}
                  onBlur={e => e.target.style.borderColor = dark.border}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="content" style={labelStyle}>내용</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                  required
                  rows={12}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: "1.7" }}
                  onFocus={e => e.target.style.borderColor = dark.accent}
                  onBlur={e => e.target.style.borderColor = dark.border}
                />
                <p style={{ fontSize: "12px", color: dark.textMuted, textAlign: "right", marginTop: "4px" }}>
                  {content.length}자
                </p>
              </div>

              <div style={{ marginBottom: "2rem" }}>
                <label style={labelStyle}>이미지</label>
                <label htmlFor="image" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  border: `1.5px dashed ${dark.accent}`,
                  borderRadius: "10px",
                  background: dark.accentDim,
                  color: "#a78bfa",
                  fontSize: "13px",
                  cursor: "pointer",
                }}>
                  📎 {image ? image.name : "이미지를 선택하세요"}
                </label>
                <input type="file" id="image" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
              </div>

              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: `1px solid ${dark.border}`,
                paddingTop: "1.5rem",
              }}>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("작성 중인 내용은 저장되지 않습니다. 취소하시겠습니까?")) router.push("/list");
                  }}
                  style={{
                    padding: "9px 20px",
                    fontSize: "13px",
                    borderRadius: "8px",
                    border: `1px solid ${dark.border}`,
                    background: "transparent",
                    color: dark.textSecondary,
                    cursor: "pointer",
                  }}
                >
                  취소하기
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "9px 24px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "8px",
                    border: "none",
                    background: dark.accent,
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostForm;
