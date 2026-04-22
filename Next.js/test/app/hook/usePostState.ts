"use client"

import { useState, SyntheticEvent } from "react";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export function usePostState(id: string, onDeleteSuccess?: () => void) {
    const { email } = useAuthGuard();

    const [postLike, setPostLike] = useState(0);
    const [postHate, setPostHate] = useState(0);

    const [commentTitle, setCommentTitle] = useState("");
    const [commentContent, setCommentContent] = useState("");

    const [comment, setComment] = useState<any[]>([]);
    const [downComments, setDownComments] = useState<any[]>([]);

    const [commentLikeCounts, setCommentLikeCounts] = useState<{ [key: number]: number }>({});
    const [commentHateCounts, setCommentHateCounts] = useState<{ [key: number]: number }>({});

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

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

    const handleSubmit = async (e: SyntheticEvent) => {
        const token = sessionStorage.getItem("token");

        e.preventDefault();
        if (!confirm("댓글을 작성하시겠습니까?")) return;
        try {
            const formData = new FormData();
            formData.append("commentTitle", commentTitle);
            formData.append("commentContent", commentContent);
            formData.append("writer", email);
            await fetch(`/api/Comment/addComment/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            setCommentTitle("");
            setCommentContent("");
            reloadComment(id);
        } catch (err) {
            console.error("CommentAddError:", err);
        }
    };

    const handleDelete = async () => {
        const token = sessionStorage.getItem("token");
        if (!window.confirm("정말 삭제하시겠습니까?")) return;
        try {
            const results = await Promise.all([
                fetch(`/api/Comment/DownComment/removeAllDownComment/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/Comment/Hate/removeAllCommentHate/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/Comment/Like/removeAllCommentLike/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/Comment/removeAllComment/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/posts/Hate/removeAllHate/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/posts/Like/removeAllLike/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/posts/removePost/${id}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (results.every(r => r.status === 200)) {
                alert("삭제 되었습니다.");
                onDeleteSuccess?.();
            }
        } catch (err) {
            console.error("error:", err);
        }
    };

    const handleAddReply = async (upperCommentId: number, title: string, content: string) => {
        const token = sessionStorage.getItem("token");
        try {
            const formData = new FormData();
            formData.append("replyTitle", title);
            formData.append("replyContent", content);
            formData.append("upperCommentId", String(upperCommentId));

            await fetch(`/api/Comment/DownComment/addDownComment/${id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            reloadComment(id);
        } catch (err) {
            console.error("ReplyCommetnAddError:::::", err);
        }
    };

    const removeComment = async (commentId: string) => {
        const token = sessionStorage.getItem("token");
        try {
            const [likeRes, hateRes, deleteRes] = await Promise.all([
                fetch(`/api/Comment/Like/removeCommentLike/${commentId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/Comment/Hate/removeCommentHate/${commentId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
                fetch(`/api/Comment/removeComment/${commentId}`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
            ]);
            if (likeRes.status === 200 && hateRes.status === 200 && deleteRes.status === 200) {
                alert("댓글 삭제 되었습니다.");
                reloadComment(id);
            }
        } catch (err) {
            console.error("remove Comment Error:", err);
        }
    };

    const handleRemoveReply = async (downCommentId: number) => {
        const token = sessionStorage.getItem("token");
        try {
            const res = await fetch(`/api/Comment/DownComment/removeComment/${downCommentId}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) reloadComment(id);
        } catch (err) {
            console.error("대댓글 삭제 에러:", err);
        }
    };

    const handleCommentLike = async (commentId: string) => {
        const token = sessionStorage.getItem("token");
        try {
            const data = await fetch(`/api/Comment/Like/getEachCommentLike/${commentId}?name=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json());
            if (data.length === 0) {
                await fetch(`/api/Comment/Like/addCommentLike/${commentId}?name=${email}&postId=${id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await fetch(`/api/Comment/Like/removeEachCommentLike/${commentId}?name=${email}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            reloadCommentLikeAndHate(id);
        } catch (err) {
            console.error("댓글 좋아요 에러:", err);
        }
    };

    const handleCommentHate = async (commentId: string) => {
        const token = sessionStorage.getItem("token");
        try {
            const data = await fetch(`/api/Comment/Hate/getEachCommentHate/${commentId}?name=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json());
            if (data.length === 0) {
                await fetch(`/api/Comment/Hate/addCommentHate/${commentId}?name=${email}&postId=${id}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await fetch(`/api/Comment/Hate/removeEachCommentHate/${commentId}?name=${email}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            reloadCommentLikeAndHate(id);
        } catch (err) {
            console.error("댓글 싫어요 에러:", err);
        }
    };

    const handleLike = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const data = await fetch(`/api/posts/Like/getEachPostLike/${id}?name=${email}`, {
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json());
            if (data.length === 0) {
                await fetch(`/api/posts/Like/addPostLike/${id}?name=${email}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await fetch(`/api/posts/Like/removePostLike/${id}?name=${email}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            reloadPostLikeAndHate(id);
        } catch (err) {
            console.error("좋아요 에러:", err);
        }
    };

    const handleHate = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const data = await fetch(`/api/posts/Hate/getEachPostHate?id=${id}&name=${email}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            }).then(r => r.json());

            if (data.length === 0) {
                await fetch(`/api/posts/Hate/addPostHate/${id}?name=${email}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await fetch(`/api/posts/Hate/removePostHate/${id}?name=${email}`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            reloadPostLikeAndHate(id);
        } catch (err) {
            console.error("싫어요 에러:", err);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setPreviewImage(URL.createObjectURL(file));
    };

    return {
        reloadPostLikeAndHate, postLike, setPostLike, postHate, setPostHate,
        reloadComment, comment, setComment, downComments, setDownComments, commentHateCounts, setCommentHateCounts,
        commentLikeCounts, setCommentLikeCounts, reloadCommentLikeAndHate, handleSubmit, commentTitle, setCommentTitle,
        commentContent, setCommentContent, handleDelete, handleAddReply, removeComment, handleRemoveReply,
        handleCommentLike, handleCommentHate, handleLike, handleHate, handleImageChange, imageFile, setImageFile,
        previewImage, setPreviewImage
    };
}