"use client";

import { useEffect, useState, use} from "react";
import { dark } from "./_components/darkTheme";
import PostCard from "./_components/PostCard";
import CommentForm from "./_components/CommentForm";
import CommentTable from "./_components/CommentTable";
import { usePostState } from "@/app/hook/usePostState";

const PostDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);

  const { postLike, setPostLike ,postHate, setPostHate, 
        comment, setComment, downComments, setDownComments, commentHateCounts, 
        setCommentHateCounts, commentLikeCounts, setCommentLikeCounts, handleSubmit, 
        commentTitle, commentContent, setCommentContent, router, handleDelete, 
        handleAddReply, removeComment, handleRemoveReply, setCommentTitle, 
        handleCommentLike, handleCommentHate, handleLike, handleHate
   } = usePostState(id);

  const [post, setPost] = useState<any>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;
  const totalPages = Math.ceil(comment.length / itemPerPage);
  const pagedComments = comment.slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage);
  
  useEffect(() => {
    fetch(`/api/posts/addViewCount/${id}`, { method: "POST" }).catch(err => console.log("View Count 에러:", err));
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
    <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", alignItems: "center", justifyContent: "center", color: dark.textMuted, fontSize: "15px" }}>
      로딩 중...
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: dark.bg, padding: "2rem 1rem" }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <button onClick={() => router.back()} style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: dark.textMuted, background: "transparent", border: "none", cursor: "pointer", marginBottom: "1.5rem", padding: "6px 10px", borderRadius: "8px" }}>
          ← 목록으로
        </button>

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
          <span style={{ fontSize: "15px", fontWeight: 600, color: dark.textPrimary }}>댓글</span>
          <span style={{ fontSize: "12px", padding: "2px 8px", borderRadius: "20px", background: dark.surface2, color: dark.textSecondary }}>{comment.length}</span>
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
    </div>
  );
};

export default PostDetail;