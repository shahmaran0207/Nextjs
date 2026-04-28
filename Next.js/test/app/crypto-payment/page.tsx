"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styles from "./page.module.css";
import { Wallet, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";

export default function CryptoPaymentPage() {
  // 상태 관리
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 송금 관련 상태
  const [recipient, setRecipient] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // MetaMask 설치 여부 확인
  const isMetaMaskInstalled = typeof window !== "undefined" && (window as any).ethereum;

  // 지갑 연결 함수
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      setError("MetaMask가 설치되어 있지 않습니다. 브라우저 확장 프로그램을 설치해주세요.");
      return;
    }

    try {
      setIsConnecting(true);
      setError(null);

      // 1. MetaMask에 지갑 연결 요청 (이때 브라우저 팝업이 뜹니다)
      // window.ethereum은 MetaMask가 브라우저에 주입(Inject)한 객체입니다.
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length > 0) {
        const address = accounts[0];
        setAccount(address);

        // 2. 연결된 지갑의 잔액 조회
        // ethers.BrowserProvider는 window.ethereum을 감싸서 이더리움 네트워크와 통신하게 해줍니다.
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const balanceWei = await provider.getBalance(address);

        // Wei 단위를 ETH 단위로 변환 (1 ETH = 10^18 Wei)
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "지갑 연결에 실패했습니다.");
    } finally {
      setIsConnecting(false);
    }
  };

  // 트랜잭션 전송(결제) 함수
  const sendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;

    try {
      setIsSending(true);
      setError(null);
      setTxHash(null);

      // 1. Provider와 Signer 가져오기
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      // Signer는 트랜잭션에 '서명'할 수 있는 권한을 가진 객체입니다. (현재 연결된 내 계정)
      const signer = await provider.getSigner();

      // 2. 트랜잭션 객체 생성
      const tx = {
        to: recipient,
        // 입력받은 ETH 수량을 다시 Wei 단위로 변환
        value: ethers.parseEther(amount)
      };

      // 3. 트랜잭션 전송 및 서명 (이때 MetaMask 결제 승인 팝업이 뜹니다)
      const transactionResponse = await signer.sendTransaction(tx);

      // 4. 전송 완료 후 해시값 저장
      setTxHash(transactionResponse.hash);

      // (선택) 트랜잭션이 블록에 완전히 기록될 때까지 기다리기
      // await transactionResponse.wait(); 

      // 잔액 갱신
      const newBalanceWei = await provider.getBalance(account);
      setBalance(parseFloat(ethers.formatEther(newBalanceWei)).toFixed(4));

    } catch (err: any) {
      console.error(err);
      setError(err.message || "트랜잭션 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  // 계정 변경 감지
  useEffect(() => {
    if (isMetaMaskInstalled) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // 계정이 바뀌면 잔액도 다시 불러와야 하지만 여기서는 생략
        } else {
          setAccount(null);
          setBalance("0");
        }
      };

      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, [isMetaMaskInstalled]);

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
          {error && (
            <div className={styles.panel} style={{ borderColor: '#ff3366', backgroundColor: 'rgba(255, 51, 102, 0.1)' }}>
              <div className={styles.panelTitle} style={{ color: '#ff3366' }}><AlertCircle size={20} /> 오류 발생</div>
              <p>{error}</p>
            </div>
          )}

          {/* 지갑 연동 패널 */}
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
                    <span className={styles.statusLabel}>보유 잔액</span>
                    <span className={styles.statusValue}>{balance} ETH</span>
                  </div>
                </>
              ) : (
                <button
                  className={styles.connectBtn}
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "연결 중..." : "MetaMask 지갑 연결하기"}
                </button>
              )}
            </div>

            <div className={styles.explainBox}>
              <div className={styles.explainTitle}>📖 로직 설명 및 테스트 코인 받기</div>
              <p className={styles.explainText}>
                사용자가 버튼을 누르면 <code>window.ethereum.request</code> 함수가 호출되어 브라우저에 설치된 메타마스크에 접근 권한을 요청합니다.
              </p>
              <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.3)', borderRadius: '6px' }}>
                <strong style={{ color: '#ffa500', display: 'block', marginBottom: '5px' }}>💡 테스트 코인(ETH)이 없으신가요?</strong>
                <span style={{ color: '#e0e0e0', fontSize: '0.9rem' }}>
                  실제 결제(트랜잭션) 기능을 테스트하려면 가짜 이더리움이 필요합니다.<br />
                  1. 메타마스크 상단 네트워크를 <b>[Sepolia 테스트 네트워크]</b>로 변경하세요. (설정에서 '테스트 네트워크 표시' 켜기)<br />
                  2. 아래 Faucet(수도꼭지) 사이트에서 지갑 주소를 넣고 무료 테스트 코인을 받으세요.<br />
                  <a href="https://sepoliafaucet.com/" target="_blank" rel="noreferrer" style={{ color: '#00f0ff', textDecoration: 'underline', marginTop: '5px', display: 'inline-block' }}>👉 Alchemy Sepolia Faucet 가기</a><br />
                  <a href="https://cloud.google.com/application/web3/faucet/ethereum/sepolia" target="_blank" rel="noreferrer" style={{ color: '#00f0ff', textDecoration: 'underline', display: 'inline-block' }}>👉 Google Cloud Faucet 가기</a>
                </span>
              </div>
            </div>
          </div>

          {/* 결제(송금) 패널 */}
          <div className={styles.panel} style={!account ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
            <div className={styles.panelTitle}>
              <Send size={20} />
              2단계: 트랜잭션 전송 (Transaction)
            </div>

            <form onSubmit={sendTransaction}>
              <div className={styles.formGroup}>
                <label className={styles.label}>받는 사람 (Wallet Address)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="0x..."
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>보낼 수량 (ETH)</label>
                <input
                  type="number"
                  step="0.0001"
                  className={styles.input}
                  placeholder="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.sendBtn}
                disabled={isSending || !account}
              >
                {isSending ? "트랜잭션 서명 및 전송 중..." : "결제 트랜잭션 실행"}
              </button>
            </form>

            {txHash && (
              <div className={styles.statusRow} style={{ marginTop: '20px', backgroundColor: 'rgba(0, 240, 255, 0.1)', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                <span className={styles.statusLabel} style={{ color: '#00f0ff' }}><CheckCircle2 size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} /> 결제 완료</span>
                <span className={styles.statusValue} style={{ fontSize: '0.85rem' }}>{txHash.slice(0, 10)}...{txHash.slice(-10)}</span>
              </div>
            )}

            <div className={styles.explainBox}>
              <div className={styles.explainTitle}>📖 로직 설명</div>
              <p className={styles.explainText}>
                송금을 위해 <code>ethers.BrowserProvider</code>를 통해 <code>Signer</code>(서명자) 객체를 가져옵니다.
                우리가 만든 트랜잭션 정보(받는 사람, 금액)를 <code>signer.sendTransaction()</code> 함수에 넣으면,
                메타마스크가 팝업을 띄워 사용자에게 <strong>"진짜 이 돈을 보낼 것인지 당신의 개인키로 서명하라"</strong>고 요구합니다. 서명이 완료되면 실제 블록체인 네트워크로 거래가 전송됩니다.
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
