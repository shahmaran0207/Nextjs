"use client"

import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();

    const confirmed = confirm("저장하시겠습니까?");
    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      if (image) formData.append("image", image);

      await fetch("/api/addPost", {
        method: "POST",
        body: formData,
      });
      setTitle("");
      setContent("");
      setImage(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "2.5rem",
        width: "100%",
        maxWidth: "600px",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
      }}>
        <h1 style={{
          fontSize: "22px",
          fontWeight: 600,
          color: "#3b5bdb",
          marginBottom: "2rem",
        }}>
          ✏️ 글 작성하기
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="title" style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#868e96",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              제목
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="제목을 입력하세요"
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "15px",
                border: "1.5px solid #dee2e6",
                borderRadius: "10px",
                background: "#f8f9fa",
                color: "#212529",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#74c0fc"}
              onBlur={e => e.target.style.borderColor = "#dee2e6"}
            />
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label htmlFor="content" style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#868e96",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              내용
            </label>
            <textarea
              name="content"
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder="내용을 입력하세요..."
              required
              rows={10}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "15px",
                border: "1.5px solid #dee2e6",
                borderRadius: "10px",
                background: "#f8f9fa",
                color: "#212529",
                outline: "none",
                resize: "vertical",
                lineHeight: "1.7",
                boxSizing: "border-box",
                fontFamily: "inherit",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#74c0fc"}
              onBlur={e => e.target.style.borderColor = "#dee2e6"}
            />
            <p style={{
              fontSize: "12px",
              color: "#adb5bd",
              textAlign: "right",
              marginTop: "4px",
            }}>
              {content.length}자
            </p>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#868e96",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              이미지
            </label>
            <label htmlFor="image" style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              border: "1.5px dashed #74c0fc",
              borderRadius: "10px",
              background: "#f0f8ff",
              color: "#4dabf7",
              fontSize: "14px",
              cursor: "pointer",
            }}>
              📎 {image ? image.name : "이미지를 선택하세요"}
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            borderTop: "1px solid #f1f3f5",
            paddingTop: "1.5rem",
          }}>
            <button
              type="button"
              onClick={() => {
                const confirmed = confirm("작성 중인 내용은 저장되지 않습니다. 그래도 취소하시겠습니까?");
                if (confirmed) router.push("/board");
              }}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                borderRadius: "10px",
                border: "1.5px solid #dee2e6",
                background: "transparent",
                color: "#868e96",
                cursor: "pointer",
              }}
            >
              취소하기
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 24px",
                fontSize: "14px",
                fontWeight: 600,
                borderRadius: "10px",
                border: "none",
                background: "#4dabf7",
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
  );
};

export default PostForm;