"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import PostCard from "./_components/PostCard";
import CommentForm from "./_components/CommentForm";
import CommentTable from "./_components/CommentTable";
import { usePostState } from "@/app/hook/usePostState";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { PageHeader } from "@/component/PageHeader";

const PostDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  useAuthGuard();

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
    const token = localStorage.getItem("token");
    fetch(`/api/posts/addViewCount/${id}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    }).catch(err => console.error("View Count 에러:", err));
  }, []);

  useEffect(() => {
    const getPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = { Authorization: `Bearer ${token}` };
        const [downCommentData, postData, commentData, likeText, hateText] = await Promise.all([
          fetch(`/api/Comment/DownComment/getEachComment/${id}`, { headers: authHeader }).then(r => r.json()),
          fetch(`/api/posts/getPostList/${id}`, { headers: authHeader }).then(r => r.json()),
          fetch(`/api/Comment/getEachComment/${id}`, { headers: authHeader }).then(r => r.json()),
          fetch(`/api/posts/Like/getPostLike/${id}`, { headers: authHeader }).then(r => r.text()),
          fetch(`/api/posts/Hate/getPostHate/${id}`, { headers: authHeader }).then(r => r.text()),
        ]);
        setDownComments(Array.isArray(downCommentData) ? downCommentData : []);
        setPost(postData);
        const safeCommentData = Array.isArray(commentData) ? commentData : [];
        setComment(safeCommentData);
        setPostLike(likeText ? JSON.parse(likeText)?.length ?? 0 : 0);
        setPostHate(hateText ? JSON.parse(hateText)?.length ?? 0 : 0);

        const commentLikes = await Promise.all(
          safeCommentData.map((c: any) => fetch(`/api/Comment/Like/getCommentLike/${c.id}`, { headers: authHeader }).then(r => r.json()))
        );

        const likeCounts: { [key: number]: number } = {};
        safeCommentData.forEach((c: any, i: number) => { likeCounts[c.id] = commentLikes[i]?.length ?? 0; });
        setCommentLikeCounts(likeCounts);

        const commentHates = await Promise.all(
          safeCommentData.map((c: any) => fetch(`/api/Comment/Hate/getCommentHate/${c.id}`, { headers: authHeader }).then(r => r.json()))
        );

        const hateCounts: { [key: number]: number } = {};
        safeCommentData.forEach((c: any, i: number) => { hateCounts[c.id] = commentHates[i]?.length ?? 0; });
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
      <PageHeader
        icon="📝"
        title="게시글 상세"
        subtitle="게시글 보기"

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/list", label: "← 목록으로" },
        ]}
      />

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