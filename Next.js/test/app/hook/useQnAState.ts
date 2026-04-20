"use client"

import React, { useState, SyntheticEvent } from "react"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function useQnAState(id: string) {
    const router = useRouter();

    const { data: session } = useSession();
    const name = session?.user?.name || "";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const [questoinLike, setQuestionLike] = useState(0);
    const [questionHate, setQuestionHate] = useState(0);
    const [answerLike, setAnswerLike] = useState(0);
    const [answerHate, setAnswerHate] = useState(0);

    const [answer, setAnswer] = useState<any[]>([]);

    const [editMode, setEditMode] = useState(false);
    const [qEditMode, setQEditMode] = useState(false);

    const [qna, setQna] = useState<any>(null);
    const [image, setImage] = useState<File | null>(null);

    const handleUpdateAnswer = () => {
        setTitle(answer[0].title);
        setContent(answer[0].content);
        setEditMode(true);
    };

    const getQuestionLike = async () => {
        const res = await fetch(`/api/QnA/Question/Like/getEachLike/${id}`);
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setQuestionLike(test);
    };

    const getQuestionHate = async () => {
        const res = await fetch(`/api/QnA/Question/Hate/getEachHate/${id}`);
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setQuestionHate(test);
    };

    // answerId를 직접 파라미터로 받아 클로저 문제 방지
    // answer 상태 대신 실제 데이터를 직접 전달받음
    const getAnswerLike = async (answerId?: string) => {
        const targetId = answerId ?? answer[0]?.id;
        if (!targetId) return;
        const res = await fetch(`/api/QnA/Answer/Like/getEachLike/${targetId}`);
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setAnswerLike(test);
    };

    const getAnswerHate = async (answerId?: string) => {
        const targetId = answerId ?? answer[0]?.id;
        if (!targetId) return;
        const res = await fetch(`/api/QnA/Answer/Hate/getEachHate/${targetId}`);
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setAnswerHate(test);
    };

    const handleQuestionHate = async () => {
        try {
            const data = await fetch(`/api/QnA/Question/Hate/getEachQuestionHate/${id}?name=${name}`);
            const res = await data.json();

            if (res == null) {
                try {
                    await fetch(`/api/QnA/Question/Hate/addQuestionHate/${id}?name=${name}`, {
                        method: "POST"
                    });
                    getQuestionHate();
                } catch (error) {
                    console.error("QuestionHate Add Error:::::", error);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Question/Hate/removeEachQuestionHate/${id}?name=${name}`, {
                        method: "POST"
                    })
                    getQuestionHate();
                } catch (err) {
                    console.error("remove EachQuestion Hate Error:::::::::::", err)
                }
            }

        } catch (err) {
            console.error("Question Hate Error::::::::::", err);
        }
    };

    const handleAnswerHate = async () => {
        if (answer.length === 0) return;
        const answerId = answer[0]?.id;
        if (!answerId) return;

        try {
            const res = await fetch(`/api/QnA/Answer/Hate/getEachAnswerHate/${answerId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await res.json();

            if (data === null) {
                try {
                    await fetch(`/api/QnA/Answer/Hate/addEachAnswerHate/${answerId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name })
                    });
                    getAnswerHate(answerId);
                } catch (err) {
                    console.error("AnswerHate Add Error::::::", err);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Answer/Hate/removeEachAnswerHate/${answerId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name })
                    });
                    getAnswerHate(answerId);
                } catch (err) {
                    console.error("AnswerHate Remove Error:::::", err);
                }
            }
        } catch (err) {
            console.error("handleAnswerHate Error::::::::::", err);
        }
    };

    const handleAnswerLike = async () => {
        if (answer.length === 0) return;
        const answerId = answer[0]?.id;
        if (!answerId) return;

        try {
            const res = await fetch(`/api/QnA/Answer/Like/getEachAnswerLike/${answerId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name })
            });
            const data = await res.json();

            if (data === null) {
                try {
                    await fetch(`/api/QnA/Answer/Like/addEachAnswerLike/${answerId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name })
                    });
                    getAnswerLike(answerId);
                } catch (err) {
                    console.error("AnswerLike Add Error::::::", err);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Answer/Like/removeEachAnswerLike/${answerId}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name })
                    });
                    getAnswerLike(answerId);
                } catch (err) {
                    console.error("AnswerLike Remove Error:::::", err);
                }
            }
        } catch (err) {
            console.error("handleAnswerLike Error::::::::::", err);
        }
    };

    const handleQuestionLike = async () => {
        try {
            const data = await fetch(`/api/QnA/Question/Like/getEachQuestionLike/${id}?name=${name}`);
            const res = await data.json();

            if (res === null) {
                try {
                    await fetch(`/api/QnA/Question/Like/addQuestionLike/${id}?name=${name}`, {
                        method: "POST"
                    });
                    getQuestionLike();
                } catch (err) {
                    console.error("QuestionLike Add Error:::::::::", err);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Question/Like/removeEachQuestionLike/${id}?name=${name}`, {
                        method: "POST"
                    })
                    getQuestionLike();
                } catch (err) {
                    console.error("QuestionLike Remove Error:::::::::::", err);
                }
            }
        } catch (err) {
            console.error("QuestionLike Error:::::::::::", err);
        }
    };

    const handleCancel = async () => {
        setEditMode(false);
        setQEditMode(false);
        setTitle("");
        setContent("");
        setImage(null);
    };

    const handleUpdAnswer = async () => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (image) formData.append("image", image);

            await fetch(`/api/QnA/Answer/updateAnswer/${id}`, {
                method: "POST",
                body: formData
            });
            handleCancel();
            getAnswer();
        } catch (error) {
            console.error("QnA Answer Update Error:::::::::::::", error);
        };
    };

    const handleUpdQuestion = async () => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (image) formData.append("image", image);

            await fetch(`/api/QnA/Question/updateQuestion/${id}`, {
                method: "POST",
                body: formData
            });
            handleCancel();
            getEachQnA();
        } catch (error) {
            console.error("QnA Question Update Error:::::::::::::", error);
        };
    };

    const getAnswer = async () => {
        const res = await fetch(`/api/QnA/Answer/getAnswer/${id}`);
        const data = await res.json();
        if (data.error === "Not Found") {
            setAnswer([])
        } else {
            const answerData = Array.isArray(data) ? data : [data];
            setAnswer(answerData);
            // setAnswer 후 answer 상태는 즉시 반영되지 않으므로
            // 직접 파라미터로 answerId를 전달해 클로저 문제 방지
            const answerId = answerData[0]?.id;
            getAnswerLike(answerId);
            getAnswerHate(answerId);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImage(e.target.files[0]);
    };

    const getEachQnA = async () => {
        const res = await fetch(`/api/QnA/Question/getQnAList/${id}`);
        const data = await res.json();
        setQna(data);
    };

    const handleSubmit = async (e: SyntheticEvent) => {
        e.preventDefault();

        if (!confirm("저장하시겠습니까?")) return;
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("QuestionId", id);
            if (image) formData.append("image", image);
            await fetch(`/api/QnA/Question/updateEnd/${id}`, { method: "POST" });
            await fetch('/api/QnA/Answer/addAnswer', { method: "POST", body: formData });
            setTitle("");
            setContent("");
            setImage(null);
            getEachQnA();
            getAnswer();
        } catch (error) {
            console.error("답변 추가 에러::::::::", error);
        }
    };

    const handleRemoveAnswer = async () => {
        if (!confirm("답변을 삭제하시겠습니까?")) return;

        try {
            await fetch(`/api/QnA/Question/reUpdateEnd/${id}`, { method: "POST" });
            await fetch(`/api/QnA/Answer/removeAnswer/${id}`, { method: "POST" });
            getEachQnA();
            getAnswer();
        } catch (error) {
            console.error("관리자 답변 삭제 에러::::::::::::::::::::::::::::::", error);
        }
    };

    const viewCount = async () => {
        await fetch(`/api/QnA/Question/addViewCount/${id}`, { method: "POST" });
    };

    const deleteQuestion = async () => {
        if (!confirm("해당 문의사항을 삭제하시겠습니까?")) return;

        try {
            const [removeAnswer, removeAnswerLike, removeAnswerHate, removeQuestionHate, removeQuestionLike, removeQuestion] = await Promise.all([
                fetch(`/api/QnA/Answer/removeAnswer/${id}`, { method: "POST" }),
                fetch(`/api/QnA/Answer/Like/removeAnswerLike/${id}`, { method: "POST" }),
                fetch(`/api/QnA/Answer/Hate/removeAnswerHate/${id}`, { method: "POST" }),
                fetch(`/api/QnA/Question/Hate/removeQuestionHate/${id}`, { method: "POST" }),
                fetch(`/api/QnA/Question/Like/removeQuestionLike/${id}`, { method: "POST" }),
                fetch(`/api/QnA/Question/removeQuestion/${id}`, { method: "POST" })
            ]);

            if (removeAnswer.status === 200 && removeAnswerLike.status === 200 && removeAnswerHate.status === 200 && removeQuestionHate.status === 200 && removeQuestionLike.status === 200 && removeQuestion.status === 200) {
                alert("삭제 되었습니다.");
                router.push("/")
            };

        } catch (err) {
            console.error("delete Question Error::::::::::", err);
        }
    };

    const questionUpdateMode = async () => {
        setTitle(qna.title);
        setContent(qna.content);
        setQEditMode(true);
    };

    const handleUpdateQuestion = async () => {
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (image) formData.append("image", image);

            await fetch(`/api/QnA/Question/updateQuestion/${id}`, {
                method: "POST",
                body: formData
            });

            handleCancel();
            getEachQnA();
        } catch (error) {
            console.error("Question Update Error:::::::::::::", error);
        }
    };

    return {
        title, setTitle, content, setContent, answer, setAnswer, handleQuestionHate,
        setQEditMode, editMode, setEditMode, handleUpdateAnswer, questoinLike,
        setQuestionLike, deleteQuestion, getQuestionLike, handleCancel, image, setImage,
        handleUpdAnswer, getAnswer, qEditMode, questionHate, setQuestionHate,
        getQuestionHate, handleImageChange, getEachQnA, questionUpdateMode, qna, setQna,
        handleSubmit, handleRemoveAnswer, viewCount, handleQuestionLike, handleUpdQuestion,
        handleUpdateQuestion, getAnswerLike, getAnswerHate, answerLike, setAnswerLike,
        answerHate, setAnswerHate, handleAnswerHate, handleAnswerLike
    };
}
