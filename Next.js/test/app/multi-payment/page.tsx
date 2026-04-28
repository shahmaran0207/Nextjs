"use client";

import { useState } from "react";
import { ethers } from "ethers";
import styles from "./page.module.css";
import { PageHeader } from "@/component/PageHeader";
import { useAuthGuard } from "../hooks/useAuthGuard";

// ── 결제 서버 주소 ────────────────────────────────────────────────
const PAYMENT_SERVER = "http://localhost:3001";

// ── PaymentReceiver 컨트랙트 최소 ABI ────────────────────────────
// pay(orderId) 함수 하나만 필요
const RECEIVER_ABI = [
  {
    inputs: [{ internalType: "string", name: "orderId", type: "string" }],
    name: "pay",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

// ── 지원 코인 목록 (각각 다른 체인) ─────────────────────────────────
// deploy-multichain.js 실행 후 확정된 실제 컨트랙트 주소
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
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
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
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
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
    contractAddress: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  },
] as const;

type Coin = (typeof COINS)[number];

// 결제 진행 단계
// 0 = 대기, 1 = 주문 생성 중, 2 = 네트워크 전환 중,
// 3 = 컨트랙트 결제 서명 중, 4 = 서버 확인 대기 중, 5 = 완료
type PayStep = 0 | 1 | 2 | 3 | 4 | 5;

export default function MultiPaymentPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const [selectedCoin, setSelectedCoin] = useState<Coin>(COINS[0]);
  const [amount, setAmount] = useState("");

  const [payStep, setPayStep] = useState<PayStep>(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  // 서버에서 발급받은 주문번호 — 블록체인 이벤트와 매칭하는 핵심 키
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
    if (!account || !amount) return;

    try {
      setError(null);
      setTxHash(null);
      setOrderId(null);

      // 1단계: 결제 서버에 주문 생성
      setPayStep(1);
      const orderRes = await fetch(`${PAYMENT_SERVER}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!orderRes.ok) throw new Error("주문 생성 실패");
      const { orderId: newOrderId } = await orderRes.json();
      setOrderId(newOrderId);
      // 이 orderId가 블록체인 이벤트와 DB를 연결하는 핵심 키

      // 2단계: 선택한 체인으로 MetaMask 네트워크 전환
      setPayStep(2);
      await switchToChain(selectedCoin);

      // 3단계: PaymentReceiver.pay(orderId) 호출
      // 단순 ETH 전송이 아니라 컨트랙트 함수를 호출 — 이벤트를 발생시킴
      setPayStep(3);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        selectedCoin.contractAddress,
        RECEIVER_ABI,
        signer
      );
      const tx = await contract.pay(newOrderId, {
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();
      setTxHash(receipt!.hash);

      // 4단계: 결제 서버에 DB 업데이트 완료 확인 (폴링)
      // 서버가 이벤트를 감지해 DB를 "paid"로 바꿀 때까지 대기
      setPayStep(4);
      let confirmed = false;
      for (let i = 0; i < 20; i++) {
        await new Promise((r) => setTimeout(r, 1500)); // 1.5초 대기
        const statusRes = await fetch(`${PAYMENT_SERVER}/api/order/${newOrderId}`);
        const statusData = await statusRes.json();
        if (statusData.status === "paid") {
          confirmed = true;
          break;
        }
      }
      if (!confirmed) throw new Error("서버 확인 시간 초과 (이벤트 감지 실패)");

      setPayStep(5);
    } catch (err: any) {
      console.error("결제 실패:", err);
      setError("결제 실패: " + (err.reason || err.message));
      setPayStep(0);
    }
  };

  const isProcessing = payStep > 0 && payStep < 5;

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
          {amount && (
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
                <span className={styles.summaryKey}>수신 컨트랙트</span>
                <span className={styles.summaryVal}>
                  {selectedCoin.contractAddress.slice(0, 10)}...{selectedCoin.contractAddress.slice(-6)}
                </span>
              </div>
              {orderId && (
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>주문번호</span>
                  <span className={styles.summaryVal} style={{ fontSize: '0.75rem' }}>{orderId}</span>
                </div>
              )}
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
            className={`${styles.payBtn} ${isProcessing ? styles.payBtnActive : payStep === 5 ? styles.payBtnDone : ""}`}
            onClick={payStep === 5 ? () => { setPayStep(0); setTxHash(null); setAmount(""); setOrderId(null); } : handlePay}
            disabled={isProcessing || !account || !amount}
          >
            {payStep === 0 && `💳 ${selectedCoin.symbol}으로 결제하기`}
            {payStep === 1 && "⏳ [1/4] 주문번호 생성 중…"}
            {payStep === 2 && `⏳ [2/4] ${selectedCoin.chainName}으로 네트워크 전환 중…`}
            {payStep === 3 && "⏳ [3/4] MetaMask 서명 중… 팝업을 확인하세요"}
            {payStep === 4 && "⏳ [4/4] 서버 결제 확인 중… (이벤트 감지 대기)"}
            {payStep === 5 && "✅ 결제 완료! — 다시 결제하기"}
          </button>

          {/* 진행 상태 바 */}
          {isProcessing && (
            <div className={styles.progressBar}>
              {[1, 2, 3, 4].map((s) => (
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
                <div style={{ color: '#64748b', marginBottom: '4px' }}>주문번호</div>
                {orderId}
              </div>
              <div className={styles.resultHash} style={{ marginTop: '10px' }}>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>TX Hash</div>
                {txHash}
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#34d399' }}>
                {selectedCoin.chainName} 체인에서 결제가 완료되어 DB에 저장되었습니다.
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
