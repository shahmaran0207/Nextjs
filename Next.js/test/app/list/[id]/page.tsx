"use client";

import { useEffect, useState, use, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { dark } from "./_components/darkTheme";
import PostCard from "./_components/PostCard";
import CommentForm from "./_components/CommentForm";
import CommentTable from "./_components/CommentTable";

const PostDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [postLike, setPostLike] = useState(0);
  const [postHate, setPostHate] = useState(0);
  const [commentLikeCounts, setCommentLikeCounts] = useState<{ [key: number]: number }>({});
  const [commentHateCounts, setCommentHateCounts] = useState<{ [key: number]: number }>({});
  const [comment, setComment] = useState<any[]>([]);
  const [downComments, setDownComments] = useState<any[]>([]);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;
  const totalPages = Math.ceil(comment.length / itemPerPage);
  const pagedComments = comment.slice((currentPage - 1) * itemPerPage, currentPage * itemPerPage);
  const { data: session } = useSession();
  const name = session?.user?.name || "";
  const router = useRouter();

  const reloadPostLikeAndHate = async (postId: string) => {
    const likeText = await fetch(`/api/posts/Like/getPostLike/${postId}`).then(r => r.text());
    setPostLike(likeText ? JSON.parse(likeText)?.length ?? 0 : 0);
    const hateText = await fetch(`/api/posts/Hate/getPostHate/${postId}`).then(r => r.text());
    setPostHate(hateText ? JSON.parse(hateText)?.length ?? 0 : 0);
  };

  const reloadComment = async (postId: string) => {
    const commentData = await fetch(`/api/Comment/getEachComment/${postId}`).then(r => r.json());
    setComment(commentData);
    const downCommentData = await fetch(`/api/Comment/DownComment/getEachComment/${postId}`).then(r => r.json());
    setDownComments(Array.isArray(downCommentData) ? downCommentData : []);
  };

  const reloadCommentLikeAndHate = async (postId: string) => {
    const commentData = await fetch(`/api/Comment/getEachComment/${postId}`).then(r => r.json());
    setComment(commentData);
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
  };

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

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const results = await Promise.all([
        fetch(`/api/Comment/DownComment/removeAllDownComment/${post.id}`, { method: "POST"}),
        fetch(`/api/Comment/Hate/removeAllCommentHate/${post.id}`, { method: "POST" }),
        fetch(`/api/Comment/Like/removeAllCommentLike/${post.id}`, { method: "POST" }),
        fetch(`/api/Comment/removeAllComment/${post.id}`, { method: "POST" }),
        fetch(`/api/posts/Hate/removeAllHate/${post.id}`, { method: "POST" }),
        fetch(`/api/posts/Like/removeAllLike/${post.id}`, { method: "POST" }),
        fetch(`/api/posts/removePost/${post.id}`, { method: "POST" }),
      ]);
      if (results.every(r => r.status === 200)) {
        alert("삭제 되었습니다.");
        router.push("/");
      }
    } catch (err) {
      console.error("error:", err);
    }
  };

  const handleAddReply = async (upperCommentId: number, title: string, content: string) => {
    try {
      const formData = new FormData();
      formData.append("replyTitle", title);
      formData.append("replyContent", content);
      formData.append("upperCommentId", String(upperCommentId));
      reloadComment(post.id); 

      await fetch(`/api/Comment/DownComment/addDownComment/${post.id}`, {
        method: "POST", body: formData
      });
    } catch(err) {
      console.error("ReplyCommetnAddError:::::", err);
    } 
  };

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!confirm("댓글을 작성하시겠습니까?")) return;
    try {
      const formData = new FormData();
      formData.append("commentTitle", commentTitle);
      formData.append("commentContent", commentContent);
      formData.append("writer", name);
      await fetch(`/api/Comment/addComment/${post.id}`, { method: "POST", body: formData });
      setCommentTitle("");
      setCommentContent("");
      reloadComment(post.id);
    } catch (err) {
      console.error("CommentAddError:", err);
    }
  };

  const removeComment = async (commentId: string) => {
    try {
      const [likeRes, hateRes, deleteRes] = await Promise.all([
        fetch(`/api/Comment/Like/removeCommentLike/${commentId}`, { method: "POST" }),
        fetch(`/api/Comment/Hate/removeCommentHate/${commentId}`, { method: "POST" }),
        fetch(`/api/Comment/removeComment/${commentId}`, { method: "POST" }),
      ]);
      if (likeRes.status === 200 && hateRes.status === 200 && deleteRes.status === 200) {
        alert("댓글 삭제 되었습니다.");
        reloadComment(post.id);
      }
    } catch (err) {
      console.error("remove Comment Error:", err);
    }
  };

  const handleRemoveReply = async (downCommentId: number) => {
    try {
      const res = await fetch(`/api/Comment/DownComment/removeComment/${downCommentId}`, { method: "POST" });
      if (res.status === 200) reloadComment(post.id);
    } catch (err) {
      console.error("대댓글 삭제 에러:", err);
    }
  };

  const handleCommentLike = async (commentId: string) => {
    try {
      const data = await fetch(`/api/Comment/Like/getEachCommentLike/${commentId}?name=${name}`).then(r => r.json());
      if (data.length === 0) {
        await fetch(`/api/Comment/Like/addCommentLike/${commentId}?name=${name}&postId=${post.id}`, { method: "POST" });
      } else {
        await fetch(`/api/Comment/Like/removeEachCommentLike/${commentId}?name=${name}`, { method: "POST" });
      }
      reloadCommentLikeAndHate(post.id);
    } catch (err) {
      console.error("댓글 좋아요 에러:", err);
    }
  };

  const handleCommentHate = async (commentId: string) => {
    try {
      const data = await fetch(`/api/Comment/Hate/getEachCommentHate/${commentId}?name=${name}`).then(r => r.json());
      if (data.length === 0) {
        await fetch(`/api/Comment/Hate/addCommentHate/${commentId}?name=${name}&postId=${post.id}`, { method: "POST" });
      } else {
        await fetch(`/api/Comment/Hate/removeEachCommentHate/${commentId}?name=${name}`, { method: "POST" });
      }
      reloadCommentLikeAndHate(post.id);
    } catch (err) {
      console.error("댓글 싫어요 에러:", err);
    }
  };

  const handleLike = async () => {
    try {
      const data = await fetch(`/api/posts/Like/getEachPostLike/${post.id}?name=${name}`).then(r => r.json());
      if (data.length === 0) {
        await fetch(`/api/posts/Like/addPostLike/${post.id}?name=${name}`, { method: "POST" });
      } else {
        await fetch(`/api/posts/Like/removePostLike/${post.id}?name=${name}`, { method: "POST" });
      }
      reloadPostLikeAndHate(post.id);
    } catch (err) {
      console.error("좋아요 에러:", err);
    }
  };

  const handleHate = async () => {
    try {
      const data = await fetch(`/api/posts/Hate/getEachPostHate?id=${post.id}&name=${name}`, { method: "POST" }).then(r => r.json());
      if (data.length === 0) {
        await fetch(`/api/posts/Hate/addPostHate/${post.id}?name=${name}`, { method: "POST" });
      } else {
        await fetch(`/api/posts/Hate/removePostHate/${post.id}?name=${name}`, { method: "POST" });
      }
      reloadPostLikeAndHate(post.id);
    } catch (err) {
      console.error("싫어요 에러:", err);
    }
  };

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
