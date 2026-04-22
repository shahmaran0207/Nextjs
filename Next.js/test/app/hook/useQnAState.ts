"use client"

import React, { useState, SyntheticEvent } from "react"
import { useRouter } from "next/navigation";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";

export function useQnAState(id: string) {
    const { email } = useAuthGuard();

    const router = useRouter();

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
        const res = await fetch(`/api/QnA/Question/Like/getEachLike/${id}`, {
            credentials: 'include'
        });
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setQuestionLike(test);
    };

    const getQuestionHate = async () => {
        const res = await fetch(`/api/QnA/Question/Hate/getEachHate/${id}`, {
            credentials: 'include'
        });
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setQuestionHate(test);
    };

    const getAnswerLike = async (answerId?: string) => {
        const targetId = answerId ?? answer[0]?.id;
        if (!targetId) return;
        const res = await fetch(`/api/QnA/Answer/Like/getEachLike/${targetId}`, {
            credentials: 'include'
        });
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setAnswerLike(test);
    };

    const getAnswerHate = async (answerId?: string) => {
        const targetId = answerId ?? answer[0]?.id;
        if (!targetId) return;
        const res = await fetch(`/api/QnA/Answer/Hate/getEachHate/${targetId}`, {
            credentials: 'include'
        });
        const test = res ? (await res.json())?.length ?? 0 : 0;
        setAnswerHate(test);
    };

    const handleQuestionHate = async () => {
        try {
            const data = await fetch(`/api/QnA/Question/Hate/getEachQuestionHate/${id}?name=${email}`, {
                credentials: 'include'
            });
            const res = await data.json();

            if (res == null) {
                try {
                    await fetch(`/api/QnA/Question/Hate/addQuestionHate/${id}?name=${email}`, {
                        method: "POST",
                        credentials: 'include'
                    });
                    getQuestionHate();
                } catch (error) {
                    console.error("QuestionHate Add Error:::::", error);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Question/Hate/removeEachQuestionHate/${id}?name=${email}`, {
                        method: "POST",
                        credentials: 'include'
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
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data === null) {
                try {
                    await fetch(`/api/QnA/Answer/Hate/addEachAnswerHate/${answerId}`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email })
                    });
                    getAnswerHate(answerId);
                } catch (err) {
                    console.error("AnswerHate Add Error::::::", err);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Answer/Hate/removeEachAnswerHate/${answerId}`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email })
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
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (data === null) {
                try {
                    await fetch(`/api/QnA/Answer/Like/addEachAnswerLike/${answerId}`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email })
                    });
                    getAnswerLike(answerId);
                } catch (err) {
                    console.error("AnswerLike Add Error::::::", err);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Answer/Like/removeEachAnswerLike/${answerId}`, {
                        method: "POST",
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ email })
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
            const data = await fetch(`/api/QnA/Question/Like/getEachQuestionLike/${id}`, {
                credentials: 'include'
            });
            const res = await data.json();

            if (res === null) {
                try {
                    await fetch(`/api/QnA/Question/Like/addQuestionLike/${id}`, {
                        method: "POST",
                        credentials: 'include'
                    });
                    getQuestionLike();
                } catch (err) {
                    console.error("QuestionLike Add Error:::::::::", err);
                }
            } else {
                try {
                    await fetch(`/api/QnA/Question/Like/removeEachQuestionLike/${id}`, {
                        method: "POST",
                        credentials: 'include'
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
                credentials: 'include',
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
                credentials: 'include',
                body: formData
            });
            handleCancel();
            getEachQnA();
        } catch (error) {
            console.error("QnA Question Update Error:::::::::::::", error);
        };
    };

    const getAnswer = async () => {
        const res = await fetch(`/api/QnA/Answer/getAnswer/${id}`, {
            credentials: 'include'
        });
        const data = await res.json();
        if (data.error === "Not Found") {
            setAnswer([])
        } else {
            const answerData = Array.isArray(data) ? data : [data];
            setAnswer(answerData);
            const answerId = answerData[0]?.id;
            getAnswerLike(answerId);
            getAnswerHate(answerId);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImage(e.target.files[0]);
    };

    const getEachQnA = async () => {
        const res = await fetch(`/api/QnA/Question/getQnAList/${id}`, {
            credentials: 'include'
        });
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
            formData.append("writer", email);
            if (image) formData.append("image", image);
            await fetch(`/api/QnA/Question/updateEnd/${id}`, {
                method: "POST",
                credentials: 'include'
            });
            await fetch('/api/QnA/Answer/addAnswer', {
                method: "POST",
                credentials: 'include',
                body: formData
            });
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
            await fetch(`/api/QnA/Question/reUpdateEnd/${id}`, {
                method: "POST",
                credentials: 'include'
            });
            await fetch(`/api/QnA/Answer/removeAnswer/${id}`, {
                method: "POST",
                credentials: 'include'
            });
            getEachQnA();
            getAnswer();
        } catch (error) {
            console.error("관리자 답변 삭제 에러::::::::::::::::::::::::::::::", error);
        }
    };

    const viewCount = async () => {
        await fetch(`/api/QnA/Question/addViewCount/${id}`, {
            method: "POST",
            credentials: 'include'
        });
    };

    const deleteQuestion = async () => {
        if (!confirm("해당 문의사항을 삭제하시겠습니까?")) return;

        try {
            const [removeAnswer, removeAnswerLike, removeAnswerHate, removeQuestionHate, removeQuestionLike, removeQuestion] = await Promise.all([
                fetch(`/api/QnA/Answer/removeAnswer/${id}`, { method: "POST", credentials: 'include' }),
                fetch(`/api/QnA/Answer/Like/removeAnswerLike/${id}`, { method: "POST", credentials: 'include' }),
                fetch(`/api/QnA/Answer/Hate/removeAnswerHate/${id}`, { method: "POST", credentials: 'include' }),
                fetch(`/api/QnA/Question/Hate/removeQuestionHate/${id}`, { method: "POST", credentials: 'include' }),
                fetch(`/api/QnA/Question/Like/removeQuestionLike/${id}`, { method: "POST", credentials: 'include' }),
                fetch(`/api/QnA/Question/removeQuestion/${id}`, { method: "POST", credentials: 'include' })
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
                credentials: 'include',
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
