"use client"

import { useQnAState } from "@/app/hook/useQnAState";
import { use, useEffect } from "react";
import Question from "./component/Question";
import QuestionEditForm from "./component/QuestionEditForm";
import AnswerEditForm from "./component/AnswerEditForm";
import Answer from "./component/Answer";
import AnswerForm from "./component/AnswerForm";
import { dark } from "@/app/list/[id]/_components/darkTheme";

export default function EachQnA({ params }: { params: Promise<{id: string}>}) {
    const { id } = use(params);

    const { title, setTitle, content, setContent, answer, handleRemoveAnswer, qEditMode, 
        questionUpdateMode, editMode, handleUpdateAnswer, questoinLike, handleSubmit,
        getEachQnA, deleteQuestion, getQuestionLike, handleCancel, image, handleUpdAnswer,
        questionHate, handleQuestionHate, getAnswer, getQuestionHate, handleImageChange, 
        qna, viewCount, handleQuestionLike, handleUpdQuestion, handleUpdateQuestion
    } = useQnAState(id);

    useEffect(() => {
        viewCount();
        getEachQnA();
        getAnswer();
        getQuestionLike();
        getQuestionHate();
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
                    <AnswerForm
                        title={title}
                        content={content}
                        image={image}
                        onTitleChange={setTitle}
                        onContentChange={setContent}
                        onImageChange={handleImageChange}
                        onSubmit={handleSubmit}
                    />
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
                    />
                    )}
            </div>
        </div>
    )
}