"use client";

import { Fragment, useState } from "react";
import { dark } from "./darkTheme";

interface CommentTableProps {
  comments: any[];
  downComments: any[];
  commentLikeCounts: { [key: number]: number };
  commentHateCounts: { [key: number]: number };
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onCommentLike: (commentId: string) => void;
  onCommentHate: (commentId: string) => void;
  onRemoveComment: (commentId: string) => void;
  onRemoveReply: (downCommentId: number) => void;
  onAddReply: (upperCommentId: number, title: string, content: string) => void;
}

export default function CommentTable({
  comments, downComments, commentLikeCounts, commentHateCounts,
  currentPage, totalPages, onPageChange,
  onCommentLike, onCommentHate, onRemoveComment, onRemoveReply, onAddReply,
}: CommentTableProps) {
  
  const [openReplyId, setOpenReplyId] = useState<number | null>(null);
  const [replyTitle, setReplyTitle] = useState("");
  const [replyContent, setReplyContent] = useState("");

  if (comments.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2.5rem", color: dark.textMuted, fontSize: "14px", border: `1px dashed ${dark.border}`, borderRadius: "12px" }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>💬</div>
        아직 작성된 댓글이 없어요
      </div>
    );
  }

  return (
    <>
      <div style={{ background: dark.surface, borderRadius: "12px", border: `1px solid ${dark.border}`, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: dark.surface2, borderBottom: `1px solid ${dark.border}` }}>
              {["번호", "제목", "내용", "작성자", "좋아요", "싫어요", "삭제", "대댓글"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "center", fontWeight: 500, color: dark.textMuted, fontSize: "12px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comments.map((c: any) => (
              <Fragment key={c.id}>
                <tr style={{ borderBottom: `1px solid ${dark.border}`, transition: "background .1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = dark.surface2)}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "11px 14px", textAlign: "center", color: dark.textMuted }}>{c.id}</td>
                  <td style={{ padding: "11px 14px", fontWeight: 500, color: dark.textPrimary, textAlign: "center" }}>{c.commenttitle}</td>
                  <td style={{ padding: "11px 14px", color: dark.textSecondary, textAlign: "center" }}>{c.commentcontent}</td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "20px", background: dark.surface2, color: dark.textSecondary }}>{c.commentwriter}</span>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <button onClick={() => onCommentLike(c.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", border: `1px solid #14532d`, borderRadius: "20px", background: dark.greenDim, color: dark.green, fontSize: "12px", cursor: "pointer" }}>
                      👍 {commentLikeCounts[c.id] ?? 0}
                    </button>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <button onClick={() => onCommentHate(c.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 10px", border: `1px solid #7f1d1d`, borderRadius: "20px", background: dark.redDim, color: dark.red, fontSize: "12px", cursor: "pointer" }}>
                      👎 {commentHateCounts[c.id] ?? 0}
                    </button>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <button onClick={() => onRemoveComment(c.id)}
                      style={{ padding: "4px 10px", border: `1px solid #7f1d1d`, borderRadius: "6px", background: dark.redDim, color: dark.red, fontSize: "12px", cursor: "pointer" }}>
                      삭제
                    </button>
                  </td>
                  <td style={{ padding: "11px 14px", textAlign: "center" }}>
                    <button onClick={() => setOpenReplyId(openReplyId === c.id ? null : c.id)}
                      style={{ padding: "4px 10px", border: `1px solid ${dark.border}`, borderRadius: "6px", background: dark.surface2, color: dark.textSecondary, fontSize: "12px", cursor: "pointer" }}>
                      💬 {downComments.filter((d: any) => d.upprcommentid === c.id).length}
                    </button>
                  </td>
                </tr>

                {openReplyId === c.id && (
                  <tr key={`reply-${c.id}`}>
                    <td colSpan={8} style={{ padding: "0", background: dark.bg }}>
                      <div style={{ padding: "12px 20px", borderBottom: `1px solid ${dark.border}` }}>
                        {downComments.filter((d: any) => d.upprcommentid === c.id).map((d: any) => (
                          <div key={d.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: `1px dashed ${dark.border}`, fontSize: "13px" }}>
                            <span style={{ color: dark.textMuted, fontSize: "11px" }}>↳</span>
                            <span style={{ color: "#a78bfa", fontWeight: 500, minWidth: "60px" }}>{d.commenttitle}</span>
                            <span style={{ color: dark.textSecondary, flex: 1 }}>{d.commentcontent}</span>
                            <span style={{ fontSize: "11px", padding: "2px 7px", borderRadius: "20px", background: dark.surface2, color: dark.textMuted }}>{d.commentwriter}</span>
                            <button onClick={() => onRemoveReply(d.id)}
                              style={{ padding: "3px 8px", border: `1px solid #7f1d1d`, borderRadius: "6px", background: dark.redDim, color: dark.red, fontSize: "11px", cursor: "pointer" }}>
                              삭제
                            </button>
                          </div>
                        ))}

                        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                          <input type="text" placeholder="제목" value={replyTitle} onChange={e => setReplyTitle(e.target.value)}
                            style={{ padding: "7px 10px", border: `1px solid ${dark.border}`, borderRadius: "6px", fontSize: "13px", color: dark.textPrimary, background: dark.surface2, outline: "none", width: "120px" }} />
                          <input type="text" placeholder="대댓글 내용" value={replyContent} onChange={e => setReplyContent(e.target.value)}
                            style={{ padding: "7px 10px", border: `1px solid ${dark.border}`, borderRadius: "6px", fontSize: "13px", color: dark.textPrimary, background: dark.surface2, outline: "none", flex: 1 }} />
                          <button onClick={() => { onAddReply(c.id, replyTitle, replyContent); setReplyTitle(""); setReplyContent(""); }}
                            style={{ padding: "7px 14px", background: dark.accent, color: "#fff", border: "none", borderRadius: "6px", fontSize: "13px", cursor: "pointer" }}>
                            등록
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "1.25rem" }}>
          <button onClick={() => onPageChange(Math.max(currentPage - 1, 1))} disabled={currentPage === 1}
            style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${dark.border}`, background: dark.surface, color: currentPage === 1 ? dark.textMuted : dark.textPrimary, cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "13px" }}>
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => onPageChange(page)}
              style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${currentPage === page ? dark.accent : dark.border}`, background: currentPage === page ? dark.accent : dark.surface, color: currentPage === page ? "#fff" : dark.textSecondary, cursor: "pointer", fontSize: "13px", fontWeight: currentPage === page ? 600 : 400 }}>
              {page}
            </button>
          ))}
          <button onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))} disabled={currentPage === totalPages}
            style={{ padding: "6px 12px", borderRadius: "8px", border: `1px solid ${dark.border}`, background: dark.surface, color: currentPage === totalPages ? dark.textMuted : dark.textPrimary, cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "13px" }}>
            다음
          </button>
        </div>
      )}
    </>
  );
}
