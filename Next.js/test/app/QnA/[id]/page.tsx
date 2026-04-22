"use client"

import { useQnAState } from "@/app/hook/useQnAState";
import { use, useEffect } from "react";
import Question from "./component/Question";
import QuestionEditForm from "./component/QuestionEditForm";
import AnswerEditForm from "./component/AnswerEditForm";
import Answer from "./component/Answer";
import AnswerForm from "./component/AnswerForm";
import { dark } from "@/app/list/[id]/_components/darkTheme";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { LogoutButton } from "@/component/LogoutButton";

export default function EachQnA({ params }: { params: Promise<{ id: string }> }) {
    useAuthGuard();

    const { id } = use(params);

    const { title, setTitle, content, setContent, answer, handleRemoveAnswer, qEditMode,
        questionUpdateMode, editMode, handleUpdateAnswer, questoinLike, handleSubmit,
        getEachQnA, deleteQuestion, getQuestionLike, handleCancel, image, handleUpdAnswer,
        questionHate, handleQuestionHate, getAnswer, getQuestionHate, handleImageChange,
        qna, viewCount, handleQuestionLike, handleUpdateQuestion, getAnswerLike, getAnswerHate,
        answerLike, handleAnswerLike, answerHate, handleAnswerHate
    } = useQnAState(id);

    useEffect(() => {
        viewCount();
        getEachQnA();
        getAnswer();
        getQuestionLike();
        getQuestionHate();
        getAnswerLike();
        getAnswerHate();
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
            display: "flex",
            flexDirection: "column",
        }}>
            {/* Digital Twin Header */}
            <header style={{
                background: "rgba(10, 14, 26, 0.95)",
                borderBottom: `1px solid ${dark.border}`,
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
                        ❓
                    </div>
                    <div>
                        <h1 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>
                            문의사항 상세
                        </h1>
                        <p style={{ margin: 0, fontSize: "11px", color: "#38bdf8", lineHeight: 1.4, marginTop: "2px" }}>
                            문의사항 및 답변 확인
                        </p>
                    </div>
                </div>

                <nav style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
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
                    <a
                        href="/QnA"
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
                        문의사항
                    </a>
                    <LogoutButton />
                </nav>
            </header>

            <div style={{ flex: 1, padding: "2rem 1rem" }}>
                <div style={{ maxWidth: "760px", margin: "0 auto" }}>
                    {/* QnA 본문 카드 */}
                    {qEditMode ? (
                        <QuestionEditForm
                            title={title}
                            content={content}
                            image={image}
                            existingImage={qna.image}
                            onTitleChange={setTitle}
                            onContentChange={setContent}
                            onImageChange={handleImageChange}
                            onSubmit={handleUpdateQuestion}
                            onCancel={handleCancel}
                        />
                    ) : (
                        <Question
                            qna={qna}
                            questoinLike={questoinLike}
                            questionHate={questionHate}
                            onDelete={deleteQuestion}
                            onEdit={questionUpdateMode}
                            onLike={handleQuestionLike}
                            onHate={handleQuestionHate}
                        />
                    )}

                    {/* 답변 영역 */}
                    {answer.length === 0 ? (
                        qEditMode ? (
                            <></>) : (
                            <>
                                <AnswerForm
                                    title={title}
                                    content={content}
                                    image={image}
                                    onTitleChange={setTitle}
                                    onContentChange={setContent}
                                    onImageChange={handleImageChange}
                                    onSubmit={handleSubmit}
                                />
                            </>)
                    ) : editMode ? (
                        <AnswerEditForm
                            title={title}
                            content={content}
                            image={image}
                            existingImage={answer[0].image}
                            onTitleChange={setTitle}
                            onContentChange={setContent}
                            onImageChange={handleImageChange}
                            onSubmit={handleUpdAnswer}
                            onCancel={handleCancel}
                        />
                    ) : (
                        <Answer
                            answer={answer[0]}
                            onEdit={handleUpdateAnswer}
                            onDelete={handleRemoveAnswer}
                            onLike={handleAnswerLike}
                            onHate={handleAnswerHate}
                            answerLike={answerLike}
                            answerHate={answerHate}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}