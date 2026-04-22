import { FormEvent, ChangeEvent } from "react";
import { dark } from "@/app/list/[id]/_components/darkTheme";

interface AnswerFormProps {
  title: string;
  content: string;
  image: File | null;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export default function AnswerForm({
  title,
  content,
  image,
  onTitleChange,
  onContentChange,
  onImageChange,
  onSubmit,
}: AnswerFormProps) {
  return (
    <div style={{
      background: dark.surface,
      borderRadius: "16px",
      border: `1px solid ${dark.border}`,
      padding: "1.75rem 2rem",
    }}>
      <p style={{ fontSize: "13px", color: dark.textMuted, marginBottom: "1.5rem" }}>
        💬 관리자가 아직 답변을 등록하지 않았습니다.
      </p>

      <form onSubmit={onSubmit}>
        <div style={{ marginBottom: "1.25rem" }}>
          <label htmlFor="title" style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>
            제목
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            placeholder="제목을 입력하세요"
            required
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              background: dark.surface2,
              border: `1px solid ${dark.border}`,
              color: dark.textPrimary,
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "1.25rem" }}>
          <label htmlFor="content" style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={e => onContentChange(e.target.value)}
            placeholder="내용을 입력하세요..."
            required
            rows={12}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "10px",
              background: dark.surface2,
              border: `1px solid ${dark.border}`,
              color: dark.textPrimary,
              fontSize: "14px",
              outline: "none",
              resize: "vertical",
              lineHeight: "1.7",
              boxSizing: "border-box",
            }}
          />
          <p style={{ fontSize: "12px", color: dark.textMuted, textAlign: "right", marginTop: "4px" }}>
            {content.length}자
          </p>
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>
            이미지
          </label>
          <label htmlFor="image" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            borderRadius: "10px",
            background: dark.surface2,
            border: `1px solid ${dark.border}`,
            color: dark.accent,
            fontSize: "13px",
            cursor: "pointer",
          }}>
            {image ? image.name : "이미지를 선택하세요"}
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={onImageChange}
            style={{ display: "none" }}
          />
        </div>

        <button type="submit" style={{
          padding: "10px 24px",
          borderRadius: "10px",
          background: dark.accent,
          border: "none",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: "pointer",
        }}>
          저장
        </button>
      </form>
    </div>
  );
}