"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styles from "./page.module.css";
import { Wallet, Send, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
// deployed-addresses.json에서 컨트랙트 주소 + ABI를 직접 가져옴
import deployedData from "../../blockchain-study/deployed/deployed-addresses.json";

const GAS_ADDR = deployedData.contracts.GasToken.address;
const PAY_ADDR = deployedData.contracts.PayToken.address;
const DUAL_ADDR = deployedData.contracts.DualPayment.address;
const GAS_ABI = deployedData.contracts.GasToken.abi;
const PAY_ABI = deployedData.contracts.PayToken.abi;
const DUAL_ABI = deployedData.contracts.DualPayment.abi;

export default function CryptoPaymentPage() {
  // ── 지갑 상태 ──────────────────────────────────────────────────────
  const [account, setAccount] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string>("0");
  const [gasBalance, setGasBalance] = useState<string>("0");
  const [payBalance, setPayBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── ETH 송금 상태 (기존) ──────────────────────────────────────────
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // ── DualPayment 상태 ──────────────────────────────────────────────
  const [payRecipient, setPayRecipient] = useState<string>("");
  const [payAmount, setPayAmount] = useState<string>("");
  const [feeRate, setFeeRate] = useState<number>(0);
  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [isStep1Loading, setIsStep1Loading] = useState(false);
  const [isStep2Loading, setIsStep2Loading] = useState(false);
  const [isPayLoading, setIsPayLoading] = useState(false);
  const [payTxHash, setPayTxHash] = useState<string | null>(null);
  const [dualError, setDualError] = useState<string | null>(null);
  const [recipientError, setRecipientError] = useState<string | null>(null);

  const isMetaMaskInstalled = typeof window !== "undefined" && (window as any).ethereum;

  // ── 컨트랙트 잔액 + feeRate 조회 ─────────────────────────────────
  const loadContractData = async (addr: string, provider: ethers.BrowserProvider) => {
    try {
      // 디버깅: 현재 연결된 네트워크와 확인할 주소 출력
      const network = await provider.getNetwork();
      console.log("🔍 현재 MetaMask 네트워크 chainId:", network.chainId.toString());
      console.log("🔍 확인할 DualPayment 주소:", DUAL_ADDR);

      // 컨트랙트 코드 존재 여부 먼저 확인 (0x = 배포되지 않은 주소)
      const code = await provider.getCode(DUAL_ADDR);
      console.log("🔍 컨트랙트 코드 길이:", code.length, "(0x이면 미배포)");

      if (code === "0x") {
        setDualError(`⚠️ 컨트랙트가 없습니다 (ChainID: ${network.chainId}) — MetaMask가 'Localhost 8545'에 연결되어 있는지 확인하세요.`);
        return;
      }
      const dual = new ethers.Contract(DUAL_ADDR, DUAL_ABI, provider);
      const [gasBal, payBal] = await dual.getUserBalances(addr);
      setGasBalance(parseFloat(ethers.formatEther(gasBal)).toLocaleString());
      setPayBalance(parseFloat(ethers.formatEther(payBal)).toLocaleString());
      const rate = await dual.feeRate();
      setFeeRate(Number(rate));
      setDualError(null);
    } catch (e) {
      console.error("컨트랙트 데이터 로드 실패:", e);
      setDualError("⚠️ 컨트랙트 연결 실패 — Ganache가 실행 중이고 deploy.js가 완료되었는지 확인하세요.");
    }
  };

  // ── 지갑 연결 ─────────────────────────────────────────────────────
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask가 설치되어 있지 않습니다.");
      return;
    }
    try {
      setIsConnecting(true);
      setError(null);
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        const addr = accounts[0];
        setAccount(addr);
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const balWei = await provider.getBalance(addr);
        setEthBalance(parseFloat(ethers.formatEther(balWei)).toFixed(4));
        await loadContractData(addr, provider);
      }
    } catch (err: any) {
      setError(err.message || "지갑 연결에 실패했습니다.");
    } finally {
      setIsConnecting(false);
    }
  };

  // ── ETH 직접 송금 (기존) ──────────────────────────────────────────
  const sendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    try {
      setIsSending(true);
      setError(null);
      setTxHash(null);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const tx = await signer.sendTransaction({ to: recipient, value: ethers.parseEther(amount) });
      setTxHash(tx.hash);
      const newBal = await provider.getBalance(account);
      setEthBalance(parseFloat(ethers.formatEther(newBal)).toFixed(4));
    } catch (err: any) {
      setError(err.message || "트랜잭션 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // ── Step 1: GAS approve ───────────────────────────────────────────
  const approveGas = async () => {
    if (!account || !payAmount) return;
    try {
      setIsStep1Loading(true);
      setDualError(null);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const gasContract = new ethers.Contract(GAS_ADDR, GAS_ABI, signer);
      // 수수료 계산: payAmount * feeRate / 100 (DualPayment.sol 공식과 동일)
      const payAmountWei = ethers.parseEther(payAmount);
      const feeAmount = (payAmountWei * BigInt(feeRate)) / BigInt(100);
      // DualPayment 컨트랙트에게 feeAmount만큼 GAS를 쓸 수 있는 권한 부여
      const tx = await gasContract.approve(DUAL_ADDR, feeAmount);
      await tx.wait();
      setStep1Done(true);
    } catch (err: any) {
      setDualError("GAS 허가 실패: " + (err.reason || err.message));
    } finally {
      setIsStep1Loading(false);
    }
  };

  // ── Step 2: PAY approve ───────────────────────────────────────────
  const approvePay = async () => {
    if (!account || !payAmount) return;
    try {
      setIsStep2Loading(true);
      setDualError(null);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const payContract = new ethers.Contract(PAY_ADDR, PAY_ABI, signer);
      const payAmountWei = ethers.parseEther(payAmount);
      // DualPayment 컨트랙트에게 payAmount만큼 PAY를 쓸 수 있는 권한 부여
      const tx = await payContract.approve(DUAL_ADDR, payAmountWei);
      await tx.wait();
      setStep2Done(true);
    } catch (err: any) {
      setDualError("PAY 허가 실패: " + (err.reason || err.message));
    } finally {
      setIsStep2Loading(false);
    }
  };

  // ── Step 3: DualPayment.pay() 실행 ───────────────────────────────
  const executePay = async () => {
    if (!account || !payAmount || !payRecipient) return;

    // 주소 유효성 검사: 0x로 시작하는 42자리 16진수여야 함
    // ENS(vitalik.eth 같은 이름)는 Ganache에서 지원 안 됨
    if (!ethers.isAddress(payRecipient)) {
      setDualError("⚠️ 올바른 지갑 주소를 입력하세요 (0x로 시작하는 42자리 주소)");
      return;
    }

    try {
      setIsPayLoading(true);
      setDualError(null);
      setPayTxHash(null);
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const dual = new ethers.Contract(DUAL_ADDR, DUAL_ABI, signer);
      // pay() 호출 = 내부에서 GAS fee + PAY amount 하나의 트랜잭션으로 원자적 처리
      const tx = await dual.pay(payRecipient, ethers.parseEther(payAmount));
      const receipt = await tx.wait();
      setPayTxHash(receipt.hash);
      // 잔액 갱신
      await loadContractData(account, provider);
      setStep1Done(false);
      setStep2Done(false);
      setPayAmount("");
    } catch (err: any) {
      setDualError("결제 실패: " + (err.reason || err.message));
    } finally {
      setIsPayLoading(false);
    }
  };


  // ── 계정 변경 감지 ────────────────────────────────────────────────
  useEffect(() => {
    if (!isMetaMaskInstalled) return;
    const handleChange = (accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
        setEthBalance("0");
        setGasBalance("0");
        setPayBalance("0");
      }
    };
    (window as any).ethereum.on("accountsChanged", handleChange);
    return () => (window as any).ethereum.removeListener("accountsChanged", handleChange);
  }, [isMetaMaskInstalled]);

  // 예상 수수료 표시용
  const expectedFee = payAmount && feeRate
    ? (parseFloat(payAmount) * feeRate / 100).toFixed(4)
    : "0";

  return (
    <>
      <PageHeader
        icon="💱"
        title="블록체인"
        subtitle="블록체인 테스트"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/list", label: "게시판" },
        ]}
      />

      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Web3 Crypto Payment</h1>
          <p className={styles.subtitle}>Digital Twin Environment - Blockchain Study Module</p>
        </div>

        <div className={styles.dashboard}>

          {/* 오류 패널 */}
          {error && (
            <div className={styles.panel} style={{ borderColor: '#ff3366', backgroundColor: 'rgba(255,51,102,0.1)' }}>
              <div className={styles.panelTitle} style={{ color: '#ff3366' }}><AlertCircle size={20} /> 오류</div>
              <p>{error}</p>
            </div>
          )}

          {/* ── 지갑 연결 패널 ── */}
          <div className={styles.panel}>
            <div className={styles.panelTitle}>
              <Wallet size={20} />
              1단계: 지갑 연동 (Authentication)
            </div>
            <div className={styles.statusBox}>
              {account ? (
                <>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>내 지갑 주소</span>
                    <span className={styles.statusValue}>{account.slice(0, 6)}...{account.slice(-4)}</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>ETH 잔액</span>
                    <span className={styles.statusValue}>{ethBalance} ETH</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>GAS 토큰</span>
                    <span className={styles.statusValue} style={{ color: '#00ff88' }}>{gasBalance} GAS</span>
                  </div>
                  <div className={styles.statusRow}>
                    <span className={styles.statusLabel}>PAY 토큰</span>
                    <span className={styles.statusValue} style={{ color: '#ffd700' }}>{payBalance} PAY</span>
                  </div>
                </>
              ) : (
                <button className={styles.connectBtn} onClick={connectWallet} disabled={isConnecting}>
                  {isConnecting ? "연결 중..." : "MetaMask 지갑 연결하기"}
                </button>
              )}
            </div>
          </div>

          {/* ── DualPayment 패널 ── */}
          <div
            className={styles.panel}
            style={{ borderLeftColor: '#a855f7', opacity: !account ? 0.5 : 1, pointerEvents: !account ? 'none' : 'auto' }}
          >
            <div className={styles.panelTitle} style={{ color: '#a855f7' }}>
              <Zap size={20} />
              2단계: 이중 토큰 결제 (DualPayment)
            </div>

            {dualError && (
              <div style={{ padding: '10px', marginBottom: '15px', background: 'rgba(255,51,102,0.1)', border: '1px solid #ff3366', borderRadius: '8px', color: '#ff3366', fontSize: '0.9rem' }}>
                <AlertCircle size={14} style={{ display: 'inline', marginRight: '5px' }} />
                {dualError}
              </div>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>받는 사람 지갑 주소</label>
              <input
                type="text"
                className={styles.input}
                placeholder="0x..."
                value={payRecipient}
                onChange={(e) => {
                  setPayRecipient(e.target.value);
                  setStep1Done(false);
                  setStep2Done(false);
                  // 입력 중에는 에러 초기화
                  if (recipientError) setRecipientError(null);
                }}
                onBlur={(e) => {
                  // 포커스를 잃을 때 주소 유효성 검사
                  const val = e.target.value;
                  if (val && !ethers.isAddress(val)) {
                    setRecipientError("⚠️ 올바른 지갑 주소 형식이 아닙니다 (0x로 시작하는 42자리 주소)");
                  } else {
                    setRecipientError(null);
                  }
                }}
                style={recipientError ? { borderColor: '#ff3366', boxShadow: '0 0 8px rgba(255,51,102,0.3)' } : {}}
              />
              {recipientError && (
                <div style={{ marginTop: '6px', fontSize: '0.82rem', color: '#ff6688' }}>
                  {recipientError}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>결제할 PAY 수량</label>
              <input
                type="number"
                step="1"
                className={styles.input}
                placeholder="예: 100"
                value={payAmount}
                onChange={(e) => { setPayAmount(e.target.value); setStep1Done(false); setStep2Done(false); }}
              />
              {payAmount && (
                <div style={{ marginTop: '8px', padding: '8px 12px', background: 'rgba(168,85,247,0.1)', borderRadius: '6px', fontSize: '0.85rem', color: '#c084fc' }}>
                  💸 결제 금액: <strong>{payAmount} PAY</strong> &nbsp;|&nbsp;
                  ⛽ 수수료: <strong>{expectedFee} GAS</strong> &nbsp;|&nbsp;
                  요율: <strong>{feeRate / 100}%</strong>
                </div>
              )}
            </div>

            {/* 3단계 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>

              {/* Step 1 */}
              <button
                onClick={approveGas}
                disabled={isStep1Loading || !payAmount || !payRecipient || step1Done}
                style={{
                  padding: '12px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
                  cursor: step1Done ? 'default' : 'pointer', transition: 'all 0.3s',
                  background: step1Done ? 'rgba(0,255,136,0.15)' : 'rgba(0,255,136,0.08)',
                  color: step1Done ? '#00ff88' : '#00cc6a',
                  border: `1px solid ${step1Done ? '#00ff88' : 'rgba(0,255,136,0.3)'}`,
                }}
              >
                {isStep1Loading ? "MetaMask 서명 대기 중..." : step1Done
                  ? `✅ 1단계 완료 — GAS 수수료 허가됨 (${expectedFee} GAS)`
                  : `1단계: GAS 수수료 approve (${expectedFee} GAS)`}
              </button>

              {/* Step 2 */}
              <button
                onClick={approvePay}
                disabled={isStep2Loading || !step1Done || step2Done}
                style={{
                  padding: '12px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '1rem',
                  cursor: (!step1Done || step2Done) ? 'default' : 'pointer', transition: 'all 0.3s',
                  background: step2Done ? 'rgba(255,215,0,0.15)' : 'rgba(255,215,0,0.08)',
                  color: step2Done ? '#ffd700' : '#ccaa00',
                  border: `1px solid ${step2Done ? '#ffd700' : 'rgba(255,215,0,0.3)'}`,
                }}
              >
                {isStep2Loading ? "MetaMask 서명 대기 중..." : step2Done
                  ? `✅ 2단계 완료 — PAY 결제 허가됨 (${payAmount} PAY)`
                  : `2단계: PAY 결제 approve (${payAmount || 0} PAY)`}
              </button>

              {/* Step 3 */}
              <button
                onClick={executePay}
                disabled={isPayLoading || !step1Done || !step2Done}
                style={{
                  padding: '14px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '1rem',
                  cursor: (!step1Done || !step2Done) ? 'not-allowed' : 'pointer', transition: 'all 0.3s',
                  background: (step1Done && step2Done) ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(80,80,80,0.3)',
                  color: (step1Done && step2Done) ? '#fff' : '#555',
                  border: 'none',
                  boxShadow: (step1Done && step2Done) ? '0 0 25px rgba(168,85,247,0.4)' : 'none',
                }}
              >
                {isPayLoading ? "결제 처리 중..." : "3단계: 결제 실행 → DualPayment.pay()"}
              </button>
            </div>

            {/* 결제 완료 */}
            {payTxHash && (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(168,85,247,0.1)', border: '1px solid #a855f7', borderRadius: '8px' }}>
                <div style={{ color: '#a855f7', fontWeight: 600, marginBottom: '8px' }}>
                  <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                  이중 토큰 결제 완료!
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#c084fc', wordBreak: 'break-all' }}>
                  TX Hash: {payTxHash}
                </div>
              </div>
            )}

            <div className={styles.explainBox}>
              <div className={styles.explainTitle}>📖 이중 토큰 결제 로직</div>
              <p className={styles.explainText}>
                <strong style={{ color: '#00ff88' }}>1단계 (GAS approve):</strong> DualPayment 컨트랙트에게 &quot;수수료만큼의 GAS를 가져가도 좋다&quot;고 허락합니다.<br />
                <strong style={{ color: '#ffd700' }}>2단계 (PAY approve):</strong> DualPayment 컨트랙트에게 &quot;결제금액만큼의 PAY를 가져가도 좋다&quot;고 허락합니다.<br />
                <strong style={{ color: '#a855f7' }}>3단계 (pay 실행):</strong> <code>DualPayment.pay()</code>를 호출하면, 컨트랙트가 GAS 수수료와 PAY 결제를 <strong>하나의 트랜잭션(원자성)</strong>으로 동시에 처리합니다.
              </p>
            </div>
          </div>

          {/* ── ETH 직접 송금 패널 (기존) ── */}
          <div className={styles.panel} style={!account ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            <div className={styles.panelTitle}>
              <Send size={20} />
              3단계: ETH 직접 송금 (기존 기능)
            </div>
            <form onSubmit={sendTransaction}>
              <div className={styles.formGroup}>
                <label className={styles.label}>받는 사람 (Wallet Address)</label>
                <input type="text" className={styles.input} placeholder="0x..." value={recipient} onChange={(e) => setRecipient(e.target.value)} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>보낼 수량 (ETH)</label>
                <input type="number" step="0.0001" className={styles.input} placeholder="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <button type="submit" className={styles.sendBtn} disabled={isSending || !account}>
                {isSending ? "트랜잭션 서명 및 전송 중..." : "ETH 송금 실행"}
              </button>
            </form>
            {txHash && (
              <div className={styles.statusRow} style={{ marginTop: '20px', backgroundColor: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)' }}>
                <span className={styles.statusLabel} style={{ color: '#00f0ff' }}>
                  <CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
                  송금 완료
                </span>
                <span className={styles.statusValue} style={{ fontSize: '0.85rem' }}>{txHash.slice(0, 10)}...{txHash.slice(-10)}</span>
              </div>
            )}
            <div className={styles.explainBox}>
              <div className={styles.explainTitle}>📖 로직 설명</div>
              <p className={styles.explainText}>
                <code>ethers.BrowserProvider</code>로 <code>Signer</code>를 가져와 <code>signer.sendTransaction()</code>으로 ETH를 직접 전송합니다. MetaMask 팝업에서 사용자가 서명하면 블록체인에 전송됩니다.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
