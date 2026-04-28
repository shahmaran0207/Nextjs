"use client";

// ─────────────────────────────────────────────────────────────
// /mypage/crypto-wallet
// 블록체인 지갑 주소 등록 페이지 (판매자용)
//
// 흐름:
// 1. 현재 등록된 지갑 주소 표시
// 2. MetaMask 연결
// 3. 서버에서 nonce 발급
// 4. MetaMask로 nonce 서명 → 소유권 증명
// 5. 서버 검증 통과 시 DB에 저장
// ─────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import Link from "next/link";
import styles from "./crypto-wallet.module.css";
import { PageHeader } from "@/component/PageHeader";

type WalletInfo = {
  address: string | null;
  verifiedAt: string | null;
};

// 등록 단계
type Step = "idle" | "connecting" | "signing" | "verifying" | "done" | "error";

const STEP_LABELS: Record<string, string> = {
  connecting: "MetaMask 연결 중...",
  signing: "MetaMask 서명 대기 중...",
  verifying: "서버 검증 중...",
  done: "✅ 등록 완료!",
};

export default function CryptoWalletPage() {
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({ address: null, verifiedAt: null });
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── 현재 등록된 지갑 주소 조회 ────────────────────────────
  const fetchWalletInfo = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      setWalletInfo(data);
    } catch {
      // 조회 실패는 조용히 무시
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchWalletInfo(); }, [fetchWalletInfo]);

  // ── 지갑 등록 메인 흐름 ────────────────────────────────────
  const handleRegister = async () => {
    setError(null);

    try {
      // 1. MetaMask 연결
      setStep("connecting");
      if (!(window as any).ethereum) throw new Error("MetaMask가 설치되어 있지 않습니다.");

      const accounts: string[] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const address = accounts[0];

      // 2. 서버에서 nonce 발급
      const nonceRes = await fetch("/api/wallet/nonce");
      if (!nonceRes.ok) {
        const err = await nonceRes.json();
        throw new Error(err.error ?? "nonce 발급에 실패했습니다.");
      }
      const { nonce } = await nonceRes.json();

      // 3. MetaMask로 nonce 서명
      setStep("signing");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(nonce);
      // 서명 = 개인키로 nonce를 암호화한 값 → 주소 소유권 증명
      // 개인키는 서버로 전송되지 않음

      // 4. 서버에 검증 요청
      setStep("verifying");
      const verifyRes = await fetch("/api/wallet/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error ?? "서명 검증에 실패했습니다.");
      }

      const result = await verifyRes.json();
      setWalletInfo({ address: result.address, verifiedAt: result.verifiedAt });
      setStep("done");
      setTimeout(() => setStep("idle"), 3000);

    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("rejected")) {
        setError("MetaMask 서명을 거절했습니다.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
      setStep("error");
    }
  };

  // ── 지갑 등록 해제 ─────────────────────────────────────────
  const handleRemove = async () => {
    if (!confirm("등록된 지갑 주소를 삭제하시겠습니까?\n삭제 시 크립토 결제를 받을 수 없습니다.")) return;
    const res = await fetch("/api/wallet", { method: "DELETE" });
    if (res.ok) {
      setWalletInfo({ address: null, verifiedAt: null });
      setStep("idle");
    }
  };

  const isProcessing = ["connecting", "signing", "verifying"].includes(step);

  return (
    <>
      <PageHeader
        icon="⛓️"
        title="Crypto-Wallet"
        subtitle="지갑 등록 및 확인"

        navLinks={[
          { href: "/", label: "메인 페이지" },
        ]}
      />

      <div className={styles.page}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div className={styles.iconWrap}>⛓️</div>
            <h1 className={styles.title}>크립토 지갑 등록</h1>
            <p className={styles.subtitle}>
              MetaMask 서명으로 소유권을 증명한 지갑만 등록됩니다.<br />
              등록 후 크립토 결제 수익이 이 주소로 즉시 전달됩니다.
            </p>
          </div>

          {/* 현재 등록 상태 */}
          <div className={styles.statusCard}>
            <div className={styles.statusHeader}>
              <span className={styles.statusLabel}>현재 등록된 지갑</span>
              {walletInfo.address && (
                <span className={styles.verifiedBadge}>✅ 소유권 검증됨</span>
              )}
            </div>

            {isLoading ? (
              <div className={styles.skeleton} />
            ) : walletInfo.address ? (
              <>
                <div className={styles.addressBox}>{walletInfo.address}</div>
                {walletInfo.verifiedAt && (
                  <div className={styles.verifiedAt}>
                    검증일: {new Date(walletInfo.verifiedAt).toLocaleString("ko-KR")}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>등록된 지갑 주소가 없습니다.</div>
            )}
          </div>

          {/* 진행 단계 */}
          {isProcessing && (
            <div className={styles.progressWrap}>
              {(["connecting", "signing", "verifying"] as const).map((s, i) => (
                <div key={s} className={styles.progressItem}>
                  <div className={`${styles.progressDot} ${step === s ? styles.progressDotActive :
                    (["connecting", "signing", "verifying"].indexOf(step) > i ? styles.progressDotDone : "")
                    }`} />
                  <span className={styles.progressLabel}>
                    {["MetaMask 연결", "서명", "검증"][i]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 에러 */}
          {error && <div className={styles.errorBox}>⚠️ {error}</div>}

          {/* 등록 버튼 */}
          <button
            className={`${styles.btn} ${step === "done" ? styles.btnDone : ""}`}
            onClick={handleRegister}
            disabled={isProcessing}
          >
            {isProcessing || step === "done"
              ? STEP_LABELS[step]
              : walletInfo.address
                ? "🔄 다른 지갑으로 변경"
                : "🦊 MetaMask로 지갑 등록"}
          </button>

          {/* 삭제 버튼 */}
          {walletInfo.address && !isProcessing && step !== "done" && (
            <button className={styles.removeBtn} onClick={handleRemove}>
              🗑 등록 해제
            </button>
          )}

          {/* 보안 안내 */}
          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>🔒 보안 안내</div>
            <ul className={styles.infoList}>
              <li>개인키(Private Key)는 절대 서버로 전송되지 않습니다.</li>
              <li>MetaMask가 서명하는 내용은 단순한 텍스트(nonce)입니다.</li>
              <li>서명 검증은 공개키 암호학으로 소유권만 확인합니다.</li>
              <li>지갑 주소는 공개 정보이므로 DB 저장은 안전합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
