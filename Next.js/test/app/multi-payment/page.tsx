"use client";

import { useState } from "react";
import { ethers } from "ethers";
import styles from "./page.module.css";
import { PageHeader } from "@/component/PageHeader";
import { useAuthGuard } from "../hooks/useAuthGuard";

// ── 지원 코인 목록 (각각 다른 체인) ─────────────────────────────────
// TODO: 각 체인에 컨트랙트 배포 후 address와 chainId를 실제 값으로 교체
const COINS = [
  {
    id: "chain-a",
    symbol: "ETH-A",
    name: "Chain A (Ether)",
    icon: "🔵",
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:8545",
    chainName: "Local Chain A",
    color: "#6366f1",
    // 배포 후 교체할 컨트랙트 주소 (PaymentReceiver)
    contractAddress: "",
    nativeCoin: true, // 네이티브 ETH로 결제
  },
  {
    id: "chain-b",
    symbol: "ETH-B",
    name: "Chain B (Ether)",
    icon: "🟢",
    chainId: 1338,
    rpcUrl: "http://127.0.0.1:8546",
    chainName: "Local Chain B",
    color: "#10b981",
    contractAddress: "",
    nativeCoin: true,
  },
  {
    id: "chain-c",
    symbol: "ETH-C",
    name: "Chain C (Ether)",
    icon: "🟡",
    chainId: 1339,
    rpcUrl: "http://127.0.0.1:8547",
    chainName: "Local Chain C",
    color: "#f59e0b",
    contractAddress: "",
    nativeCoin: true,
  },
] as const;

type Coin = (typeof COINS)[number];

// 결제 진행 단계
// 0 = 대기, 1 = 네트워크 전환 중, 2 = 결제 트랜잭션 중, 3 = 완료
type PayStep = 0 | 1 | 2 | 3;

export default function MultiPaymentPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[0]);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const [payStep, setPayStep] = useState<PayStep>(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { email } = useAuthGuard();

  const isMetaMaskInstalled =
    typeof window !== "undefined" && !!(window as any).ethereum;

  // ── 지갑 연결 ──────────────────────────────────────────────────────
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      alert("MetaMask가 설치되어 있지 않습니다.");
      return;
    }
    try {
      setIsConnecting(true);
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch (e) {
      console.error("지갑 연결 실패:", e);
    } finally {
      setIsConnecting(false);
    }
  };

  // ── MetaMask 네트워크 전환 ─────────────────────────────────────────
  // 선택한 코인의 체인으로 MetaMask를 자동 전환
  const switchToChain = async (coin: Coin) => {
    const chainIdHex = "0x" + coin.chainId.toString(16);
    try {
      // 이미 등록된 체인이면 전환
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (err: any) {
      // 4902 = 등록되지 않은 체인 → 새로 추가
      if (err.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: coin.chainName,
              rpcUrls: [coin.rpcUrl],
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  };

  // ── 결제 실행 ──────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!account || !amount || !recipient) return;
    if (!ethers.isAddress(recipient)) {
      setRecipientError("⚠️ 올바른 지갑 주소를 입력하세요 (0x로 시작하는 42자리)");
      return;
    }

    try {
      setError(null);
      setTxHash(null);

      // 1단계: 해당 코인의 체인으로 MetaMask 네트워크 전환
      setPayStep(1);
      await switchToChain(selectedCoin);

      // 2단계: 결제 트랜잭션 전송
      setPayStep(2);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // TODO: 컨트랙트 배포 후 PaymentReceiver.pay(orderId) 로 교체
      // 현재는 단순 ETH 전송으로 동작 확인
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();

      setTxHash(receipt!.hash);
      setPayStep(3);
    } catch (err: any) {
      console.error("결제 실패:", err);
      setError("결제 실패: " + (err.reason || err.message));
      setPayStep(0);
    }
  };

  const isProcessing = payStep > 0 && payStep < 3;

  return (
    <>
      <PageHeader
        icon="⛓️"
        title="Multi-Chain Payment"
        subtitle="원하는 코인 체인을 선택하고 결제하세요"

        navLinks={[
          { href: "/", label: "메인 페이지" },
        ]}
      />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Multi-Chain Payment</h1>
          <p className={styles.subtitle}>
            원하는 코인 체인을 선택하고 결제하세요
          </p>
        </div>

        <div className={styles.card}>

          {/* ── 지갑 연결 ── */}
          {!account ? (
            <button
              className={styles.connectBtn}
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "연결 중..." : "🦊 MetaMask 지갑 연결"}
            </button>
          ) : (
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>연결된 지갑</div>
              <div
                className={styles.networkBadge}
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <span className={styles.dot} />
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            </div>
          )}

          <hr className={styles.divider} />

          {/* ── 코인 선택 ── */}
          <div className={styles.sectionLabel}>결제 수단 선택</div>
          <div className={styles.coinGrid}>
            {COINS.map((coin) => {
              const isSelected = selectedCoin.id === coin.id;
              return (
                <label
                  key={coin.id}
                  className={`${styles.coinCard} ${isSelected ? styles.coinCardSelected : ""}`}
                  style={{ "--coin-color": coin.color } as React.CSSProperties}
                  onClick={() => {
                    setSelectedCoin(coin);
                    setPayStep(0);
                    setTxHash(null);
                    setError(null);
                  }}
                >
                  <input
                    type="radio"
                    name="coin"
                    value={coin.id}
                    checked={isSelected}
                    onChange={() => { }}
                  />
                  <div className={styles.radioMark} />
                  <div className={styles.coinIcon}>{coin.icon}</div>
                  <div className={styles.coinName}>{coin.symbol}</div>
                  <div className={styles.coinChain}>{coin.name}</div>
                  <div className={styles.coinPort}>
                    ChainID: {coin.chainId}
                  </div>
                  <div className={styles.coinPort} style={{ marginTop: '4px' }}>
                    {coin.rpcUrl}
                  </div>
                </label>
              );
            })}
          </div>

          <hr className={styles.divider} />

          {/* ── 결제 정보 입력 ── */}
          <div className={styles.formSection}>
            <label className={styles.formLabel}>받는 주소</label>
            <input
              type="text"
              className={`${styles.input} ${recipientError ? styles.inputError : ""}`}
              placeholder="0x..."
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                if (recipientError) setRecipientError(null);
                setPayStep(0);
              }}
              onBlur={(e) => {
                const val = e.target.value;
                if (val && !ethers.isAddress(val)) {
                  setRecipientError("⚠️ 올바른 지갑 주소 형식이 아닙니다 (0x로 시작하는 42자리)");
                } else {
                  setRecipientError(null);
                }
              }}
            />
            {recipientError && (
              <div className={styles.errorText}>{recipientError}</div>
            )}
          </div>

          <div className={styles.formSection}>
            <label className={styles.formLabel}>
              결제 금액 ({selectedCoin.symbol})
            </label>
            <input
              type="number"
              step="0.001"
              min="0"
              className={styles.input}
              placeholder="예: 0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setPayStep(0); }}
            />
          </div>

          {/* ── 결제 요약 ── */}
          {amount && recipient && !recipientError && (
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>결제 코인</span>
                <span className={styles.summaryVal} style={{ color: selectedCoin.color }}>
                  {selectedCoin.icon} {selectedCoin.symbol}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>체인</span>
                <span className={styles.summaryVal}>{selectedCoin.chainName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>금액</span>
                <span className={styles.summaryVal}>{amount} ETH</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryKey}>받는 주소</span>
                <span className={styles.summaryVal}>
                  {recipient.slice(0, 10)}...{recipient.slice(-6)}
                </span>
              </div>
            </div>
          )}

          {/* ── 에러 메시지 ── */}
          {error && (
            <div className={styles.errorBox}>
              ⚠️ {error}
            </div>
          )}

          {/* ── 결제 버튼 ── */}
          <button
            className={`${styles.payBtn} ${isProcessing ? styles.payBtnActive : payStep === 3 ? styles.payBtnDone : ""
              }`}
            onClick={payStep === 3 ? () => { setPayStep(0); setTxHash(null); setAmount(""); } : handlePay}
            disabled={isProcessing || !account || !amount || !recipient || !!recipientError}
          >
            {payStep === 0 && `💳 ${selectedCoin.symbol}으로 결제하기`}
            {payStep === 1 && `⏳ [1/2] ${selectedCoin.chainName}으로 네트워크 전환 중…`}
            {payStep === 2 && "⏳ [2/2] 결제 트랜잭션 서명 중… MetaMask를 확인하세요"}
            {payStep === 3 && "✅ 결제 완료! — 다시 결제하기"}
          </button>

          {/* 진행 상태 바 */}
          {isProcessing && (
            <div className={styles.progressBar}>
              {[1, 2].map((s) => (
                <div
                  key={s}
                  className={`${styles.progressStep} ${payStep >= s ? styles.progressStepActive : ""}`}
                />
              ))}
            </div>
          )}

          {/* ── 완료 결과 ── */}
          {txHash && (
            <div className={styles.resultBox}>
              <div className={styles.resultTitle}>
                ✅ 트랜잭션 완료
              </div>
              <div className={styles.resultHash}>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>TX Hash</div>
                {txHash}
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#34d399' }}>
                {selectedCoin.chainName} 체인에서 결제가 완료되었습니다.
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
