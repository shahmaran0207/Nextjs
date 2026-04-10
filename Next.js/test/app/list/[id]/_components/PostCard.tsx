"use client";

import { dark } from "./darkTheme";

interface PostCardProps {
  post: any;
  postLike: number;
  postHate: number;
  commentCount: number;
  onDelete: () => void;
  onUpdate: () => void;
  onLike: () => void;
  onHate: () => void;
}

export default function PostCard({
  post, postLike, postHate, commentCount,
  onDelete, onUpdate, onLike, onHate,
}: PostCardProps) {
  return (
    <>
      <div style={{ background: dark.surface, borderRadius: "16px", border: `1px solid ${dark.border}`, overflow: "hidden", marginBottom: "1rem" }}>
        <div style={{ height: "4px", background: `linear-gradient(90deg, ${dark.accent}, #a78bfa)` }} />
        <div style={{ padding: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", padding: "3px 10px", borderRadius: "20px", background: dark.accentDim, color: "#a78bfa", fontWeight: 500 }}>게시글</span>
            <span style={{ fontSize: "12px", color: dark.textMuted }}>
              {new Date(post.createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "20px", background: dark.surface2, color: dark.textSecondary }}>
              ✍ {post.writer ?? "작성자"}
            </span>
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 600, color: dark.textPrimary, marginBottom: "1.25rem", lineHeight: "1.4" }}>
            {post.title}
          </h1>

          <div style={{ display: "flex", gap: "16px", padding: "10px 14px", background: dark.surface2, borderRadius: "8px", marginBottom: "1.5rem", fontSize: "13px", color: dark.textMuted, flexWrap: "wrap" }}>
            <span>👁 조회수 <strong style={{ color: dark.textPrimary }}>{post.postview}</strong></span>
            <span style={{ color: dark.border }}>|</span>
            <span>👍 <strong style={{ color: dark.textPrimary }}>{postLike}</strong></span>
            <span style={{ color: dark.border }}>|</span>
            <span>👎 <strong style={{ color: dark.textPrimary }}>{postHate}</strong></span>
            <span style={{ color: dark.border }}>|</span>
            <span>💬 댓글 <strong style={{ color: dark.textPrimary }}>{commentCount}</strong></span>
          </div>

          <div style={{ fontSize: "15px", color: dark.textSecondary, lineHeight: "1.8", whiteSpace: "pre-wrap", paddingTop: "1.25rem", borderTop: `1px solid ${dark.border}` }}>
            {post.content}
          </div>

          {post.image !== null && (
            <img src={`data:image/jpeg;base64,${post.image}`} alt="이미지"
              style={{ width: "100%", borderRadius: "10px", marginTop: "1.25rem", border: `1px solid ${dark.border}` }} />
          )}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "🗑 삭제", onClick: onDelete, bg: dark.redDim, color: dark.red, border: "#7f1d1d" },
          { label: "✏ 수정", onClick: onUpdate, bg: dark.blueDim, color: dark.blue, border: "#1e3a5f" },
          { label: `👍 좋아요 ${postLike}`, onClick: onLike, bg: dark.greenDim, color: dark.green, border: "#14532d" },
          { label: `👎 싫어요 ${postHate}`, onClick: onHate, bg: dark.orangeDim, color: dark.orange, border: "#7c2d12" },
        ].map(btn => (
          <button key={btn.label} onClick={btn.onClick}
            style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: btn.bg, color: btn.color, border: `1px solid ${btn.border}`, borderRadius: "8px", fontSize: "13px", fontWeight: 500, cursor: "pointer" }}>
            {btn.label}
          </button>
        ))}
      </div>
    </>
  );
}
