"use client"

import postStyle from "@/app/hook/postStyle";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

const QnAForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  const { inputStyle, labelStyle, dark } = postStyle();

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
      await fetch("/api/QnA/Question/addQuestion", { method: "POST", body: formData });
      setTitle(""); setContent(""); setImage(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
      {/* Digital Twin Header */}
      <header style={{
        background: "rgba(10, 14, 26, 0.95)",
        borderBottom: `1px solid ${dark.border}`,
        padding: "0.75rem 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 200,
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 16px rgba(56,189,248,0.4)",
            fontSize: "16px",
          }}>
            ❓
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
              문의사항 작성
            </h1>
            <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
              새로운 문의사항을 작성합니다
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <a
            href="/"
            style={{
              fontSize: "13px",
              color: "#8b90a7",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "#8b90a7";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            홈으로
          </a>
          <a
            href="/QnA"
            style={{
              fontSize: "13px",
              color: "#8b90a7",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#e8eaf0";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(56,189,248,0.3)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "#8b90a7";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
            }}
          >
            문의사항
          </a>
        </nav>
      </header>

      <div style={{ flex: 1, padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          <div style={{ marginBottom: "2rem" }}>
            <p style={{ fontSize: "12px", color: dark.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>
              문의사항
            </p>
            <h1 style={{ fontSize: "24px", fontWeight: 600, color: dark.textPrimary, margin: 0 }}>
              문의사항 작성하기
            </h1>
          </div>

          <div style={{
            background: dark.surface,
            borderRadius: "16px",
            border: `1px solid ${dark.border}`,
            overflow: "hidden",
          }}>
            <div style={{ height: "4px", background: `linear-gradient(90deg, ${dark.accent}, #0ea5e9)` }} />
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
                    color: "#38bdf8",
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
    </div>
  );
};

export default QnAForm;
