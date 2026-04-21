"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PostCard from "./_components/PostCard";
import CommentForm from "./_components/CommentForm";
import CommentTable from "./_components/CommentTable";
import { usePostState } from "@/app/hook/usePostState";

const PostDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();

  const { postLike, setPostLike, postHate, setPostHate,
    comment, setComment, downComments, setDownComments, commentHateCounts,
    setCommentHateCounts, commentLikeCounts, setCommentLikeCounts, handleSubmit,
    commentTitle, commentContent, setCommentContent, handleDelete,
    handleAddReply, removeComment, handleRemoveReply, setCommentTitle,
    handleCommentLike, handleCommentHate, handleLike, handleHate
  } = usePostState(id, () => router.push("/"));

  const [post, setPost] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;
  const totalPages = Math.ceil(comment.length / itemPerPage);
  const pagedComments = comment.slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage);

  useEffect(() => {
    fetch(`/api/posts/addViewCount/${id}`, { method: "POST" }).catch(err => console.error("View Count 에러:", err));
  }, []);

  useEffect(() => {
    const getPost = async () => {
      try {
        const [downCommentData, postData, commentData, likeText, hateText] = await Promise.all([
          fetch(`/api/Comment/DownComment/getEachComment/${id}`).then(r => r.json()),
          fetch(`/api/posts/getPostList/${id}`).then(r => r.json()),
          fetch(`/api/Comment/getEachComment/${id}`).then(r => r.json()),
          fetch(`/api/posts/Like/getPostLike/${id}`).then(r => r.text()),
          fetch(`/api/posts/Hate/getPostHate/${id}`).then(r => r.text()),
        ]);
        setDownComments(Array.isArray(downCommentData) ? downCommentData : []);
        setPost(postData);
        setComment(commentData);
        setPostLike(likeText ? JSON.parse(likeText)?.length ?? 0 : 0);
        setPostHate(hateText ? JSON.parse(hateText)?.length ?? 0 : 0);

        const commentLikes = await Promise.all(
          commentData.map((c: any) => fetch(`/api/Comment/Like/getCommentLike/${c.id}`).then(r => r.json()))
        );

        const likeCounts: { [key: number]: number } = {};
        commentData.forEach((c: any, i: number) => { likeCounts[c.id] = commentLikes[i]?.length ?? 0; });
        setCommentLikeCounts(likeCounts);

        const commentHates = await Promise.all(
          commentData.map((c: any) => fetch(`/api/Comment/Hate/getCommentHate/${c.id}`).then(r => r.json()))
        );

        const hateCounts: { [key: number]: number } = {};
        commentData.forEach((c: any, i: number) => { hateCounts[c.id] = commentHates[i]?.length ?? 0; });
        setCommentHateCounts(hateCounts);
      } catch (err) {
        console.error("error:", err);
      }
    };
    getPost();
  }, [id]);

  if (!post) return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b90a7", fontSize: "15px" }}>
      로딩 중...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e1a", display: "flex", flexDirection: "column" }}>
      {/* 다크 상단 헤더 */}
      <header style={{
        background: "rgba(10, 14, 26, 0.95)",
        borderBottom: "1px solid rgba(56,189,248,0.15)",
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
            📝
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
              게시글 상세
            </h1>
            <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
              게시글 보기
            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <button
            onClick={() => router.back()}
            style={{
              fontSize: "13px",
              color: "#8b90a7",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent",
              cursor: "pointer",
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
            ← 목록으로
          </button>
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
        </nav>
      </header>

      <main style={{ flex: 1, padding: "2rem 1rem", overflow: "auto" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>

          <PostCard
            post={post}
            postLike={postLike}
            postHate={postHate}
            commentCount={comment.length}
            onDelete={handleDelete}
            onUpdate={() => router.push(`/updatePost/${post.id}`)}
            onLike={handleLike}
            onHate={handleHate}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#e8eaf0" }}>댓글</span>
            <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "20px", background: "#22263a", color: "#8b90a7" }}>{comment.length}</span>
          </div>

          <CommentForm
            commentTitle={commentTitle}
            commentContent={commentContent}
            onTitleChange={e => setCommentTitle(e.target.value)}
            onContentChange={e => setCommentContent(e.target.value)}
            onSubmit={handleSubmit}
            onCancel={() => { setCommentTitle(""); setCommentContent(""); }}
          />

          <CommentTable
            comments={pagedComments}
            downComments={downComments}
            commentLikeCounts={commentLikeCounts}
            commentHateCounts={commentHateCounts}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onCommentLike={handleCommentLike}
            onCommentHate={handleCommentHate}
            onRemoveComment={removeComment}
            onRemoveReply={handleRemoveReply}
            onAddReply={handleAddReply}
          />
        </div>
      </main>
    </div>
  );
};

export default PostDetail;