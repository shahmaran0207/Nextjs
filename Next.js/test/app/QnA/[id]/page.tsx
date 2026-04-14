"use client"

import { SyntheticEvent, use, useEffect, useState } from "react";

const dark = {
    bg: "#0f1117",
    surface: "#1a1d27",
    surface2: "#22263a",
    border: "#2e3247",
    textPrimary: "#e8eaf0",
    textSecondary: "#8b90a7",
    textMuted: "#545874",
    accent: "#7c6af7",
    accentDim: "#2d2850",
};

export default function EachQnA({ params }: { params: Promise<{id: string}>}) {
    const { id } = use(params);
    const [ title, setTitle ] = useState("");
    const [ content, setContent ] = useState("");
    const [ qna, setQna ] = useState<any>(null);
    const [ answer, setAnswer ] = useState<any[]>([]);
    const [image, setImage] = useState<File | null>(null);

    const getAnswer = async() => {
        const res = await fetch(`/api/QnA/Answer/getAnswer/${id}`);
        const data = await res.json();
        if(data.error==="Not Found"){
            setAnswer([])
        } else{
            setAnswer(Array.isArray(data) ? data : [data]);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setImage(e.target.files[0]);
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
            await fetch(`/api/QnA/Question/updateEnd/${id}`, { method: "POST"});
            await fetch('/api/QnA/Answer/addAnswer', { method: "POST", body: formData});
            setTitle("");
            setContent("");
            setImage(null);
            getEachQnA();
            getAnswer();
        } catch(error) {
            console.error("답변 추가 에러::::::::", error);
        }
    };

    const handleRemoveAnswer = async() => {
        if (!confirm("답변을 삭제하시겠습니까?")) return;

        try {
            await fetch(`/api/QnA/Question/reUpdateEnd/${id}`, { method: "POST"});
            await fetch(`/api/QnA/Answer/removeAnswer/${id}`, { method: "POST"});
            getEachQnA();
            getAnswer();
        } catch (error) {
            console.error("관리자 답변 삭제 에러::::::::::::::::::::::::::::::", error);
        }
    };

    const getEachQnA = async() => {
        const res = await fetch(`/api/QnA/Question/getQnAList/${id}`);
        const data = await res.json();
        setQna(data);
    };

    useEffect(() => {
        const viewCount = async() => {
            await fetch(`/api/QnA/Question/addViewCount/${id}`, { method: "POST"});
        };

        viewCount();
        getEachQnA();
        getAnswer();
    }, []);

    if (!qna) return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", alignItems: "center", justifyContent: "center", color: dark.textMuted, fontSize: "15px" }}>
            로딩 중...
        </div>
    );

    return (
        <div style={{
            minHeight: "100vh",
            background: dark.bg,
            padding: "2rem 1rem",
            margin: "-1rem calc(-50vw + 50%)",
        }}>
            <div style={{ maxWidth: "760px", margin: "0 auto" }}>

                {/* QnA 본문 카드 */}
                <div style={{
                    background: dark.surface,
                    borderRadius: "16px",
                    border: `1px solid ${dark.border}`,
                    borderLeft: `4px solid ${dark.accent}`,
                    padding: "1.75rem 2rem",
                    marginBottom: "1.5rem",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: dark.accentDim, color: "#a78bfa", fontWeight: 500 }}>
                            QnA
                        </span>
                        <span style={{ fontSize: "12px", color: dark.textMuted }}>
                            {new Date(qna.createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                        <span style={{ fontSize: "12px", color: dark.textMuted }}>👁 {qna.qnaview}</span>
                        <span style={{
                            fontSize: "11px", padding: "2px 8px", borderRadius: "20px",
                            background: qna.isend ? "#0d2e1f" : "#2e1a0d",
                            color: qna.isend ? "#4ade80" : "#fb923c",
                            fontWeight: 500,
                        }}>
                            {qna.isend ? "답변완료" : "답변대기"}
                        </span>
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: dark.textPrimary, margin: "0 0 1rem" }}>
                        {qna.title}
                    </h2>

                    <p style={{ fontSize: "14px", color: dark.textSecondary, lineHeight: "1.8", margin: "0 0 1rem", whiteSpace: "pre-wrap" }}>
                        {qna.content}
                    </p>

                    {qna.image && (
                        <img
                            src={qna.image.startsWith("data:") ? qna.image : `data:image/jpeg;base64,${qna.image}`}
                            alt="첨부 이미지"
                            style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "1rem", border: `1px solid ${dark.border}` }}
                        />
                    )}
                </div>

                {/* 답변 영역 */}
                {answer.length === 0 ? (
                    <div style={{
                        background: dark.surface,
                        borderRadius: "16px",
                        border: `1px solid ${dark.border}`,
                        padding: "1.75rem 2rem",
                    }}>
                        <p style={{ fontSize: "13px", color: dark.textMuted, marginBottom: "1.5rem" }}>
                            💬 관리자가 아직 답변을 등록하지 않았습니다.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label htmlFor="title" style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>제목</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="제목을 입력하세요"
                                    required
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: "10px",
                                        background: dark.surface2, border: `1px solid ${dark.border}`,
                                        color: dark.textPrimary, fontSize: "14px", outline: "none",
                                        boxSizing: "border-box",
                                    }}
                                />
                            </div>
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label htmlFor="content" style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>내용</label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="내용을 입력하세요..."
                                    required
                                    rows={12}
                                    style={{
                                        width: "100%", padding: "10px 14px", borderRadius: "10px",
                                        background: dark.surface2, border: `1px solid ${dark.border}`,
                                        color: dark.textPrimary, fontSize: "14px", outline: "none",
                                        resize: "vertical", lineHeight: "1.7", boxSizing: "border-box",
                                    }}
                                />
                                <p style={{ fontSize: "12px", color: dark.textMuted, textAlign: "right", marginTop: "4px" }}>
                                    {content.length}자
                                </p>
                            </div>
                            <div style={{ marginBottom: "2rem" }}>
                                <label style={{ display: "block", fontSize: "13px", color: dark.textSecondary, marginBottom: "6px" }}>이미지</label>
                                <label htmlFor="image" style={{
                                    display: "inline-flex", alignItems: "center", gap: "10px",
                                    padding: "10px 14px", borderRadius: "10px",
                                    background: dark.surface2, border: `1px solid ${dark.border}`,
                                    color: "#a78bfa", fontSize: "13px", cursor: "pointer",
                                }}>
                                    {image ? image.name : "이미지를 선택하세요"}
                                </label>
                                <input type="file" id="image" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} />
                            </div>
                            <button type="submit" style={{
                                padding: "10px 24px", borderRadius: "10px",
                                background: dark.accent, border: "none",
                                color: "#fff", fontSize: "14px", fontWeight: 600, cursor: "pointer",
                            }}>
                                저장
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{
                        background: dark.surface,
                        borderRadius: "16px",
                        border: `1px solid ${dark.border}`,
                        borderLeft: `4px solid #4ade80`,
                        padding: "1.75rem 2rem",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "20px", background: "#0d2e1f", color: "#4ade80", fontWeight: 500 }}>
                                관리자 답변
                            </span>
                            <span style={{ fontSize: "12px", color: dark.textMuted }}>
                                {new Date(answer[0].createdat).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                        <h3 style={{ fontSize: "16px", fontWeight: 600, color: dark.textPrimary, margin: "0 0 0.75rem" }}>
                            {answer[0].title}
                        </h3>
                        <p style={{ fontSize: "14px", color: dark.textSecondary, lineHeight: "1.8", margin: "0 0 0.75rem", whiteSpace: "pre-wrap" }}>
                            {answer[0].content}
                        </p>
                        {answer[0].image && (
                            <img
                                src={answer[0].image.startsWith("data:") ? answer[0].image : `data:image/jpeg;base64,${answer[0].image}`}
                                alt="답변 첨부 이미지"
                                style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "1rem", border: `1px solid ${dark.border}` }}
                            />
                        )}
                        <div style={{ display: "flex", gap: "8px", marginTop: "1.25rem" }}>
                            <button
                                type="button"
                                style={{
                                    padding: "8px 18px", borderRadius: "8px",
                                    background: dark.accentDim, border: `1px solid ${dark.accent}`,
                                    color: "#a78bfa", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                수정
                            </button>
                            <button
                                type="button"
                                style={{
                                    padding: "8px 18px", borderRadius: "8px",
                                    background: "#2e1a1a", border: "1px solid #7f1d1d",
                                    color: "#f87171", fontSize: "13px", fontWeight: 600, cursor: "pointer",
                                }}
                                onClick={handleRemoveAnswer}
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}