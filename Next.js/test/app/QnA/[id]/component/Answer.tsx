import { AnswerType } from "./types";
import { dark } from "@/app/list/[id]/_components/darkTheme";

interface AnswerProps {
  answer: AnswerType;
  onEdit: () => void;
  onDelete: () => void;
}

export default function Answer({
  answer,
  onEdit,
  onDelete,
}: AnswerProps) {
  return (
    <div style={{
      background: dark.surface,
      borderRadius: "16px",
      borderTop: `1px solid ${dark.border}`,
      borderRight: `1px solid ${dark.border}`,
      borderBottom: `1px solid ${dark.border}`,
      borderLeft: `4px solid #4ade80`,
      padding: "1.75rem 2rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#0d2e1f", color: "#4ade80", fontWeight: 500 }}>
          관리자 답변
        </span>
        <span style={{ fontSize: "12px", color: dark.textMuted }}>
          {new Date(answer.createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      <h3 style={{ fontSize: "16px", fontWeight: 600, color: dark.textPrimary, margin: "0 0 0.75rem" }}>
        {answer.title}
      </h3>

      <p style={{ fontSize: "14px", color: dark.textSecondary, lineHeight: "1.8", margin: "0 0 0.75rem", whiteSpace: "pre-wrap" }}>
        {answer.content}
      </p>

      {answer.image && (
        <img
          src={answer.image.startsWith("data:") ? answer.image : `data:image/jpeg;base64,${answer.image}`}
          alt="답변 첨부 이미지"
          style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "1rem", border: `1px solid ${dark.border}` }}
        />
      )}
      
      <div style={{ display: "flex", gap: "8px", marginTop: "1.25rem" }}>
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
          onClick={onEdit}
        >
          수정
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
          onClick={onDelete}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
