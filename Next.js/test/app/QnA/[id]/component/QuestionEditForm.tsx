import { ChangeEvent } from "react";
import { dark } from "@/app/list/[id]/_components/darkTheme";

interface QuestionEditFormProps {
  title: string;
  content: string;
  image: File | null;
  existingImage?: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function QuestionEditForm({
  title,
  content,
  image,
  existingImage,
  onTitleChange,
  onContentChange,
  onImageChange,
  onSubmit,
  onCancel,
}: QuestionEditFormProps) {
  return (
    <div style={{
      background: dark.surface,
      borderRadius: "16px",
      border: `1px solid ${dark.border}`,
      padding: "1.75rem 2rem",
    }}>
      <p style={{ fontSize: "13px", color: "#a78bfa", marginBottom: "1.5rem", fontWeight: 600 }}>
        ✏️ 문의사항 수정 중
      </p>

      <div style={{ marginBottom: "1.25rem" }}>
        <label style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
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
        <label style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>
          내용
        </label>
        <textarea
          value={content}
          onChange={e => onContentChange(e.target.value)}
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

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>
          이미지
        </label>
        
        {/* 기존 이미지 미리보기 */}
        {!image && existingImage && (
          <img
            src={existingImage.startsWith("data:") ? existingImage : `data:image/jpeg;base64,${existingImage}`}
            alt="기존 이미지"
            style={{ 
              maxWidth: "100%", 
              borderRadius: "10px", 
              marginBottom: "10px", 
              border: `1px solid ${dark.border}`, 
              opacity: 0.7 
            }}
          />
        )}
        
        {/* 새로 선택한 이미지 미리보기 */}
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="새 이미지 미리보기"
            style={{ 
              maxWidth: "100%", 
              borderRadius: "10px", 
              marginBottom: "10px", 
              border: `1px solid ${dark.accent}` 
            }}
          />
        )}
        
        <label htmlFor="edit-question-image" style={{
          display: "inline-flex", 
          alignItems: "center", 
          gap: "10px",
          padding: "10px 14px", 
          borderRadius: "10px",
          background: dark.surface2, 
          border: `1px solid ${dark.border}`,
          color: "#a78bfa", 
          fontSize: "13px", 
          cursor: "pointer",
        }}>
          {image ? image.name : "이미지 변경 (선택)"}
        </label>
        <input 
          type="file" 
          id="edit-question-image" 
          accept="image/*" 
          onChange={onImageChange} 
          style={{ display: "none" }} 
        />
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          style={{
            padding: "8px 18px", 
            borderRadius: "8px",
            background: dark.accentDim, 
            border: `1px solid ${dark.accent}`,
            color: "#a78bfa", 
            fontSize: "13px", 
            fontWeight: 600, 
            cursor: "pointer",
          }}
          onClick={onSubmit}
        >
          수정사항 제출
        </button>
        <button
          type="button"
          style={{
            padding: "8px 18px", 
            borderRadius: "8px",
            background: "#2e1a1a", 
            border: "1px solid #7f1d1d",
            color: "#f87171", 
            fontSize: "13px", 
            fontWeight: 600, 
            cursor: "pointer",
          }}
          onClick={onCancel}
        >
          취소
        </button>
      </div>
    </div>
  );
}
