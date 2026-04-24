"use client";

import { useState } from "react";
import postStyle from "../hook/postStyle";
import { PageHeader } from "@/component/PageHeader";
import { useAuthGuard } from "../hooks/useAuthGuard";
import axios from "axios";
import { RequestPayParams, RequestPayResponse } from "@/types/paymentType";

function callback(response: RequestPayResponse) {
    console.log("Full response:", response);
    const { success, error_msg, imp_uid } = response;

    if (success) {
        axios.post(`/api/orders/${imp_uid}`);
        alert("결제 성공!!!");
    } else {
        alert(`결제 실패:::: ${error_msg}`);
    }
}

export default function PaymentPage() {
    const { email } = useAuthGuard();

    const { dark, inputStyle, labelStyle } = postStyle();
    const [amount, setAmount] = useState<string>("");

    const handlePayment = async () => {
        if (!window.IMP) return;

        const { IMP } = window;
        IMP.init("imp08348266");

        const data: RequestPayParams = {
            pg: "html5_inicis",
            channel_key: "channel-key-a430aad8-4b56-4c03-a96a-af05565eec6e",
            pay_method: "card",
            merchant_uid: `mid_${new Date().getTime()}`,
            amount: Number(amount),
            name: "디지털 트윈 결제 테스트",
            buyer_name: email,
            buyer_tel: "010-1112-4885",
            buyer_email: "shahmaran0207@naver.com",
            buyer_addr: "부산 수영구",
            buyer_postcode: "48870",
            app_scheme: "digitalTwin",
        };
        IMP.request_pay(data, callback);
    };

    return (
        <div style={{ minHeight: "100vh", background: dark.bg, display: "flex", flexDirection: "column" }}>
            <PageHeader
                icon="💳"
                title="결제 시스템"
                subtitle="디지털 트윈 통합결제"

                navLinks={[
                    { href: "/", label: "메인 페이지" },
                    { href: "/QnA/write", label: "✏️ 문의하기" },
                    { href: "/list", label: "게시판" },
                ]}
            />

            <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <div style={{
                    background: dark.surface,
                    border: `1px solid ${dark.border}`,
                    width: "100%",
                    maxWidth: "400px",
                    padding: "2rem",
                    borderRadius: "16px",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem"
                }}>
                    <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                        <h2 style={{ margin: 0, color: dark.textPrimary, fontSize: "20px", fontWeight: 700 }}>결제 금액 입력</h2>
                        <p style={{ margin: "8px 0 0 0", color: dark.textSecondary, fontSize: "13px" }}>충전할 금액을 입력해주세요.</p>
                    </div>

                    <div>
                        <label style={labelStyle}>결제 금액 (원)</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{
                                    ...inputStyle,
                                    paddingRight: "40px",
                                    fontSize: "16px",
                                    fontWeight: 500,
                                    textAlign: "right"
                                }}
                                placeholder="0"
                                min="0"
                            />
                            <span style={{
                                position: "absolute",
                                right: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: dark.textSecondary,
                                fontSize: "14px"
                            }}>
                                원
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => handlePayment()}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                            color: "#0a0e1a",
                            border: "none",
                            borderRadius: "10px",
                            fontSize: "15px",
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: "0 4px 12px rgba(56, 189, 248, 0.3)",
                            marginTop: "1rem"
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 16px rgba(56, 189, 248, 0.4)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(56, 189, 248, 0.3)";
                        }}
                    >
                        결제하기
                    </button>
                </div>
            </main >
        </div >
    );
}
