import { QnAType } from "./types";
import { dark } from "@/app/list/[id]/_components/darkTheme"; 

interface QuestionProps {
  qna: QnAType;
  questoinLike: number;
  questionHate: number;
  onDelete: () => void;
  onEdit: () => void;
  onLike: () => void;
  onHate: () => void;
}

export default function Question({
  qna,
  questoinLike,
  questionHate,
  onDelete,
  onEdit,
  onLike,
  onHate,
}: QuestionProps) {
  return (
    <div style={{
      background: dark.surface,
      borderRadius: "16px",
      border: `1px solid ${dark.border}`,
      borderLeft: `4px solid ${dark.accent}`,
      padding: "1.75rem 2rem",
      marginBottom: "1.5rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: dark.accentDim, color: dark.accent, fontWeight: 500 }}>
          QnA
        </span>
        <span style={{ fontSize: "12px", color: dark.textMuted }}>
          {new Date(qna.createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
        </span>
        <span style={{ fontSize: "12px", color: dark.textMuted }}>👁 {qna.qnaview}</span>
        <span style={{
          fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
          background: qna.isend ? "#0d2e1f" : "#2e1a0d",
          color: qna.isend ? "#4ade80" : "#fb923c",
          fontWeight: 500,
        }}>
          {qna.isend ? "답변완료" : "답변대기"}
        </span>
      </div>

      <h2 style={{ fontSize: "20px", fontWeight: 700, color: dark.textPrimary, margin: "0 0 1rem" }}>
        {qna.title}
      </h2>

      <p style={{ fontSize: "14px", color: dark.textSecondary, lineHeight: "1.8", margin: "0 0 1rem", whiteSpace: "pre-wrap" }}>
        {qna.content}
      </p>

      {qna.image && (
        <img
          src={qna.image.startsWith("data:") ? qna.image : `data:image/jpeg;base64,${qna.image}`}
          alt="첨부 이미지"
          style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "1rem", border: `1px solid ${dark.border}` }}
        />
      )}

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <button onClick={onDelete}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: dark.redDim, color: dark.red, border: `1px solid #7f1d1d`, borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            🗑 삭제
          </button>
          
          {qna.isend !== 1 && (
            <button onClick={onEdit}
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: dark.blueDim, color: dark.blue, border: `1px solid #1e3a5f`, borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
              ✏ 수정
            </button>
          )}
          
          <button onClick={onLike}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: dark.greenDim, color: dark.green, border: `1px solid #14532d`, borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            👍 좋아요 {questoinLike}
          </button>
          
          <button onClick={onHate}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: dark.orangeDim, color: dark.orange, border: `1px solid #7c2d12`, borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            👎 싫어요 {questionHate}
          </button>
        </div>
      </div>
    </div>
  );
}