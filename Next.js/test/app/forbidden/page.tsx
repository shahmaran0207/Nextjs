"use client";

import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: "100vh",
            background: "#0a0e1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* 그리드 배경 */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: "50px 50px",
                opacity: 0.5,
            }} />

            {/* 글로우 효과 */}
            <div style={{
                position: "absolute",
                top: "30%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "500px",
                height: "500px",
                background: "radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)",
                filter: "blur(80px)",
                pointerEvents: "none",
            }} />

            <div style={{
                textAlign: "center",
                position: "relative",
                zIndex: 10,
                padding: "3rem",
                background: "rgba(26, 29, 39, 0.9)",
                borderRadius: "20px",
                border: "2px solid rgba(56, 189, 248, 0.3)",
                boxShadow: "0 0 40px rgba(56, 189, 248, 0.15)",
                backdropFilter: "blur(10px)",
                maxWidth: "500px",
            }}>
                {/* 403 숫자 */}
                <div style={{
                    fontSize: "120px",
                    fontWeight: 900,
                    color: "#38bdf8",
                    marginBottom: "1rem",
                    textShadow: "0 0 30px rgba(56, 189, 248, 0.5)",
                    letterSpacing: "0.1em",
                }}>
                    403
                </div>

                {/* 경고 아이콘 */}
                <div style={{
                    fontSize: "48px",
                    marginBottom: "1.5rem",
                    filter: "drop-shadow(0 0 10px rgba(56, 189, 248, 0.6))",
                }}>
                    🚫
                </div>

                {/* 제목 */}
                <h2 style={{
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#38bdf8",
                    marginBottom: "1rem",
                    textShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
                    letterSpacing: "0.05em",
                }}>
                    접근 권한 없음
                </h2>

                {/* 설명 */}
                <p style={{
                    fontSize: "16px",
                    color: "#8b90a7",
                    marginBottom: "2rem",
                    lineHeight: "1.6",
                }}>
                    이 페이지는 관리자 권한이 필요합니다.<br />
                    접근이 제한되었습니다.
                </p>

                {/* 버튼 */}
                <button
                    onClick={() => router.push("/")}
                    style={{
                        padding: "14px 32px",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#0a0e1a",
                        background: "#38bdf8",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#0ea5e9";
                        e.currentTarget.style.transform = "scale(1.05)";
                        e.currentTarget.style.boxShadow = "0 0 30px rgba(56, 189, 248, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#38bdf8";
                        e.currentTarget.style.transform = "scale(1)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(56, 189, 248, 0.3)";
                    }}
                >
                    ← 홈으로 돌아가기
                </button>
            </div>
        </div>
    );
}
