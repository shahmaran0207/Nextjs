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
import { PageHeader } from "@/component/PageHeader";

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
            <PageHeader
                icon="❓"
                title="문의사항 "
                subtitle="문의사항 세부 페이지"

                navLinks={[
                    { href: "/", label: "메인 페이지" },
                ]}
            />

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