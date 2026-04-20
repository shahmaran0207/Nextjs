"use client";

import { SyntheticEvent } from "react";
import { dark } from "./darkTheme";
import postStyle from "@/app/hook/postStyle";

interface CommentFormProps {
  commentTitle: string;
  commentContent: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: SyntheticEvent) => void;
  onCancel: () => void;
}

export default function CommentForm({
  commentTitle, commentContent,
  onTitleChange, onContentChange,
  onSubmit, onCancel,
}: CommentFormProps) {

  const { inputStyle } = postStyle();
  
  return (
    <form onSubmit={onSubmit} style={{ background: dark.surface, border: `1px solid ${dark.border}`, borderRadius: "12px", padding: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
        <input type="text" placeholder="제목" value={commentTitle} onChange={onTitleChange}
          style={{ ...inputStyle, flex: "0 0 30%" }} />
        <input type="text" placeholder="내용을 입력하세요" value={commentContent} onChange={onContentChange}
          style={{ ...inputStyle, flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button type="submit" style={{ padding: "8px 20px", background: dark.accent, color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 500, cursor: "pointer" }}>
          등록
        </button>
        <button type="button" onClick={onCancel}
          style={{ padding: "8px 14px", background: "transparent", border: `1px solid ${dark.border}`, borderRadius: "8px", fontSize: "14px", color: dark.textSecondary, cursor: "pointer" }}>
          취소하기
        </button>
      </div>
    </form>
  );
}
