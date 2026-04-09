"use client"

import { useEffect, useState, use, SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const PostDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [post, setPost] = useState<any>(null);
  const [postLike, setPostLike] = useState<any>(null);
  const [comment, setComment] = useState<any[]>([]);
  const [commentTitle, setCommentTitle] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [ currentPage, setCurrentPage] = useState(1);
  const itemPerPage = 10;
  const totalPages = Math.ceil(comment.length/itemPerPage);
  const pagedComments = comment.slice((currentPage -1)*itemPerPage, currentPage*itemPerPage);
  const { data: session } = useSession();
  const name = session?.user?.name || "";

  const router = useRouter();

  const handleCommentTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentTitle(e.target.value);
  };

  const handleCommentContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCommentContent(e.target.value);
  };

  const removeComment = async(commentId: String) => {
    try {
      const deleteComment = await fetch(`/api/Comment/removeComment/${commentId}`, {
        method: "POST"
      });
      if(deleteComment.status === 200){
        alert("댓글 삭제 되었습니다.");
        window.location.reload();
      }
    } catch(err: any){
      console.log("remove Comment Error:::::::::::::::::", err)
    }
  };

  const handleDelete = async (postId: String) => {
     const ok = window.confirm("정말 삭제하시겠습니까?");
     if (!ok) return;

    try{ 
      const deleteLike = await fetch(`/api/posts/Like/removeAllLike/${postId}`, {
        method: "POST"
      });

      const deleteComment = await fetch(`/api/Comment/removeAllComment/${postId}`, {
        method: "POST"
      });

      const del = await fetch(`/api/posts/removePost/${postId}`, {
        method: "POST"
      });

      if(deleteLike.status === 200 && del.status ===200) {
        alert("삭제 되었습니다.")
        router.push("/")
      }

    } catch(err: any){
      console.log("error:::::::::::::::::", err)
    }
  };

  const handleUpdate = async (postId: String) => {
    try{ 
        router.push( `/updatePost/${postId}`)

    } catch(err: any){
      console.error("error:::::::::::::::::", err)
    }
  };

  const handleSubmit = async (e: SyntheticEvent, postId: string, name: string) => {
    e.preventDefault();

    const confirmed = confirm("댓글을 작성하시겠습니까?");
    if(!confirmed) return;

    try{
      const formData = new FormData();
      formData.append("commentTitle", commentTitle);
      formData.append("commentContent", commentContent);
      formData.append("writer", name);

      await fetch(`/api/Comment/addComment/${postId}`, {
        method: "POST",
        body: formData,
      });
      setCommentTitle("");
      setCommentContent("");
      window.location.reload();
    } catch(err){
      console.log("CommentAddError::::::::::::::::", err)
    }
  };

  useEffect(() => {
    const upCount = async() => {
      try{
        const res = await fetch(`/api/posts/addViewCount/${id}`, {
          method: "POST"
        });
      } catch (err) {
        console.log("View Count 증가 에러:::::::::::::::", err)
      }
    };

    upCount();
  }, []);

  const handleLike = async(postId: String) => {
    try {
      const postLike = await fetch(`/api/posts/Like/getEachPostLike/${postId}?name=${name}`);
      const data = await postLike.json();

      if (data.length === 0) {
        try{
          const addLike = await fetch(`/api/posts/Like/addPostLike/${postId}?name=${name}`,{
            method: "POST"
          });
          window.location.reload();
        } catch(err: any) {
          console.error("종아요 개수 추가 에러::::::::::", err);
        }
      } else {
        try{
          const removeLike = await fetch(`/api/posts/Like/removePostLike/${postId}?name=${name}`, {
            method: "POST"
          });
          window.location.reload();

        } catch(err: any) {
          console.error("좋아요 개수 삭제 에러:::::::::", err)
        }
      }
    } catch(err) {
      console.error("좋아요 개수 수정 에러::::::::::", err);
    }

  };

  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/posts/getPostList/${id}`);
        const data = await res.json();
        setPost(data);

        const comment = await fetch(`/api/Comment/getEachComment/${id}`);
        const commentData = await comment.json();
        setComment(commentData);

        const postLike = await fetch(`/api/posts/Like/getPostLike/${id}`);
        const text = await postLike.text();
        const postLikeData = text ? JSON.parse(text) : null;
        setPostLike(postLikeData?.length ?? 0);

      } catch (err: any) {
        console.log("error::::::::::::", err);
      }
    };
    getPost();
  }, [id]);

  if (!post) return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4ff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#adb5bd",
      fontSize: "15px",
    }}>
      로딩 중...
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f0f4ff",
      padding: "2rem",
    }}>
      <div style={{
        maxWidth: "700px",
        margin: "0 auto",
      }}>
        <button
          onClick={() => router.back()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            color: "#868e96",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            marginBottom: "1.5rem",
            padding: 0,
          }}
        >
          ← 목록으로
        </button>

        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "2.5rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          borderTop: "4px solid #74c0fc",
        }}>
          <small style={{
            fontSize: "12px",
            color: "#adb5bd",
          }}>
            {new Date(post.createdat).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </small>

          <h1 style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#212529",
            margin: "0.5rem 0 1.5rem",
            lineHeight: "1.4",
          }}>
            {post.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
              color: "#6c757d",
              fontWeight: 500,
            }}
          >
            <span style={{ fontSize: "15px" }}>👁️</span>
            <span>조회수</span>
            <span style={{ color: "#212529", fontWeight: 600 }}>
              {post.postview}
            </span>
          </div>

          <div style={{
            borderTop: "1px solid #f1f3f5",
            paddingTop: "1.5rem",
            fontSize: "15px",
            color: "#495057",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
          }}>
            내용: {post.content}
          </div>
          <div style={{
            borderTop: "1px solid #f1f3f5",
            paddingTop: "1.5rem",
            fontSize: "15px",
            color: "#495057",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
          }}>
            {post.image === null ? (
              <p>이미지 없음</p>
            ) : (
              <img 
                src={`data:image/jpeg;base64,${post.image}`} 
                alt="이미지"
                style={{ width: "100%", borderRadius: "10px" }}
              />
            )}
          </div>
        </div>
        <button
          style={{
            backgroundColor: "#e53e3e",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c53030")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e53e3e")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => handleDelete(post.id)}
        >
          삭제
        </button>
        <button
          style={{
            backgroundColor: "#0633f8ff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c53030")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e53e3e")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => handleUpdate(post.id)}
        >
          수정
        </button>
        <button
          style={{
            backgroundColor: "#e53e3e",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c53030")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#e53e3e")}
          onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          onClick={() => handleLike(post.id)}
        >
          LIKE {postLike}
        </button>
      </div>

      {comment.length === 0 ? (
        <>
          <div style={{
            textAlign: "center",
            padding: "32px",
            color: "#aaa",
            fontSize: "14px",
            border: "1px dashed #e0e0e0",
            borderRadius: "8px"
          }}>
            아직 작성된 댓글이 없어요
          </div>
          <form onSubmit={(e) => handleSubmit(e, post.id, name)} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              id = "commentTitle"
              name = "commentTitle"
              placeholder="제목"
              onChange={handleCommentTitleChange}
              style={{
                flex: "0 0 30%",
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#000",
                outline: "none",
              }}
            />
            <input
              type="text"
              placeholder="내용"
              id = "commentContent"
              name = "commentContent"
              onChange = {handleCommentContentChange}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#000",
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              등록
            </button>
            <button
              type="button"
              onClick={() => {
                const confirmed = confirm("작성 중인 내용은 저장되지 않습니다. 그래도 취소하시겠습니까?");
                if (confirmed) window.location.reload();
              }}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                borderRadius: "10px",
                border: "1.5px solid #dee2e6",
                background: "transparent",
                color: "#868e96",
                cursor: "pointer",
              }}
            >
              취소하기
            </button>
          </form>
        </>
        
      ) : (
        <>
         <form onSubmit={(e) => handleSubmit(e, post.id, name)} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <input
              type="text"
              id = "commentTitle"
              name = "commentTitle"
              placeholder="제목"
              onChange={handleCommentTitleChange}
              style={{
                flex: "0 0 30%",
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#000",
                outline: "none",
              }}
            />
            <input
              type="text"
              placeholder="내용"
              id = "commentContent"
              name = "commentContent"
              onChange = {handleCommentContentChange}
              style={{
                flex: 1,
                padding: "8px 12px",
                border: "1px solid #e0e0e0",
                borderRadius: "6px",
                fontSize: "14px",
                color: "#000",
                outline: "none",
              }}
            />
            <button
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              등록
            </button>
            <button
              type="button"
              onClick={() => {
                const confirmed = confirm("작성 중인 내용은 저장되지 않습니다. 그래도 취소하시겠습니까?");
                if (confirmed) window.location.reload();
              }}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                borderRadius: "10px",
                border: "1.5px solid #dee2e6",
                background: "transparent",
                color: "#868e96",
                cursor: "pointer",
              }}
            >
              취소하기
            </button>
          </form>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "#000" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
                <th style={{ padding: "10px 16px", textAlign: "center", width: "60px" }}>번호</th>
                <th style={{ padding: "10px 16px", textAlign: "center", width: "30%" }}>제목</th>
                <th style={{ padding: "10px 16px", textAlign: "center" }}>내용</th>
                <th style={{ padding: "10px 16px", textAlign: "center" }}>작성자</th>
                <th style={{ padding: "10px 16px", textAlign: "center" }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {pagedComments.map((comment: any) =>(
                <tr key={comment.ID} style={{ borderBottom: "1px solid #f0f0f0", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <td style={{ padding: "10px 16px", textAlign: "center", color: "#bbb" }}>{comment.ID}</td>
                  <td style={{ padding: "10px 16px", fontWeight: 500, color: "#555", textAlign: "center" }}>{comment.COMMENTTITLE}</td>
                  <td style={{ padding: "10px 16px", color: "#555", textAlign: "center" }}>{comment.COMMENTCONTENT}</td>
                  <td style={{ padding: "10px 16px", color: "#555", textAlign: "center" }}>{comment.COMMENTWRITER}</td>
                  <td style={{ padding: "10px 16px", color: "#555", textAlign: "center" }}>
                    <button onClick={() => removeComment(comment.ID)}>댓글 삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "16px" }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                  background: currentPage === 1 ? "#f5f5f5" : "#fff",
                  color: currentPage === 1 ? "#ccc" : "#333",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                }}
              >
                이전
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #e0e0e0",
                    background: currentPage === page ? "#3b82f6" : "#fff",
                    color: currentPage === page ? "#fff" : "#333",
                    cursor: "pointer",
                    fontSize: "13px",
                    fontWeight: currentPage === page ? 600 : 400,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e0e0e0",
                  background: currentPage === totalPages ? "#f5f5f5" : "#fff",
                  color: currentPage === totalPages ? "#ccc" : "#333",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "13px",
                }}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostDetail;