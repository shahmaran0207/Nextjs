"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, ShieldCheck, Send, CheckCircle2, XCircle, AlertTriangle, Play, RefreshCw, Key } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./MultiSig.module.css";

interface Transaction {
  id: number;
  to: string;
  value: string;
  executed: boolean;
  numConfirmations: number;
  isConfirmedByMe: boolean;
}

export default function MultiSigPage() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [walletData, setWalletData] = useState<any>(null);

  // 상태 변수
  const [walletBalance, setWalletBalance] = useState("0");
  const [owners, setOwners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 안건 상정 폼
  const [toAddress, setToAddress] = useState("");
  const [amountEth, setAmountEth] = useState("");

  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask 설치 필요"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);

      // API에서 데이터 가져오기
      const res = await fetch("/api/multisig");
      const data = await res.json();
      setWalletData(data);

      const multisigContract = new ethers.Contract(data.address, data.abi, signer);
      setContract(multisigContract);

      await fetchState(multisigContract, accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchState = async (c: ethers.Contract, userAddress: string) => {
    try {
      // 1. 금고 잔액 조회
      const provider = c.runner?.provider;
      if (provider) {
        const bal = await provider.getBalance(await c.getAddress());
        setWalletBalance(ethers.formatEther(bal));
      }

      // 2. 소유자 목록 및 Threshold
      const _owners = await c.getOwners();
      const _threshold = await c.numConfirmationsRequired();
      setOwners(_owners);
      setThreshold(Number(_threshold));

      const isUserOwner = _owners.map((o: string) => o.toLowerCase()).includes(userAddress.toLowerCase());
      setIsOwner(isUserOwner);

      // 3. 트랜잭션 목록 조회
      const txCount = await c.getTransactionCount();
      const txs = [];
      for (let i = Number(txCount) - 1; i >= 0; i--) { // 최신순으로 정렬
        const tx = await c.getTransaction(i);
        const isConfirmed = isUserOwner ? await c.isConfirmed(i, userAddress) : false;

        txs.push({
          id: i,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          executed: tx.executed,
          numConfirmations: Number(tx.numConfirmations),
          isConfirmedByMe: isConfirmed
        });
      }
      setTransactions(txs);
    } catch (err) {
      console.error("데이터 조회 실패", err);
    }
  };

  const handleRefresh = () => {
    if (contract && account) fetchState(contract, account);
  };

  // 1. 송금 기안 올리기
  const handleSubmit = async () => {
    if (!contract || !toAddress || !amountEth) return;
    setIsLoading(true);
    try {
      const valueInWei = ethers.parseEther(amountEth);
      const tx = await contract.submitTransaction(toAddress, valueInWei, "0x");
      await tx.wait();
      alert("✅ 성공: 새로운 송금 기안이 등록되었습니다!");
      setToAddress("");
      setAmountEth("");
      handleRefresh();
    } catch (err: any) {
      alert("기안 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 결재 도장 찍기
  const handleConfirm = async (txId: number) => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const tx = await contract.confirmTransaction(txId);
      await tx.wait();
      alert("✅ 결재(서명) 완료!");
      handleRefresh();
    } catch (err: any) {
      alert("결재 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 결재 취소
  const handleRevoke = async (txId: number) => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const tx = await contract.revokeConfirmation(txId);
      await tx.wait();
      alert("❌ 결재가 취소되었습니다.");
      handleRefresh();
    } catch (err: any) {
      alert("결재 취소 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 송금 실행
  const handleExecute = async (txId: number) => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const tx = await contract.executeTransaction(txId);
      await tx.wait();
      alert("🎉 송금 완료! 금고에서 돈이 빠져나갔습니다.");
      handleRefresh();
    } catch (err: any) {
      alert("송금 실행 실패 (서명 부족 또는 잔액 부족): " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🔐"
        title="다중 서명 지갑 (MultiSig Wallet)"
        subtitle="3명 중 2명이 결재해야 돈이 나가는 기업/DAO용 철통 보안 금고"
        navLinks={[{ href: "/", label: "메인으로" }]}
      />

      <main className={styles.mainContent}>
        {!account ? (
          <div className={styles.centerBox}>
            <ShieldCheck size={48} color="#6366f1" />
            <h2>금고에 접근하려면 지갑을 연결하세요</h2>
            <button className={styles.connectBtn} onClick={connectWallet}>
              <Wallet size={20} /> MetaMask 연결
            </button>
          </div>
        ) : (
          <div className={styles.dashboard}>

            {/* 좌측: 금고 정보 */}
            <div className={styles.leftPanel}>
              <div className={styles.vaultCard}>
                <div className={styles.cardHeader}>
                  <h3>🏦 금고 상태</h3>
                  <button onClick={handleRefresh} className={styles.refreshBtn}><RefreshCw size={16} /></button>
                </div>
                <div className={styles.balanceDisplay}>
                  <span className={styles.ethIcon}>♦</span>
                  <span className={styles.balance}>{Number(walletBalance).toFixed(4)}</span>
                  <span className={styles.currency}>ETH</span>
                </div>
                <div className={styles.addressBox}>
                  <span className={styles.label}>금고 주소:</span>
                  <code>{walletData?.address}</code>
                </div>
              </div>

              <div className={styles.infoCard}>
                <h3>👥 공동 소유자 (Owners)</h3>
                <div className={styles.thresholdBadge}>
                  결재 기준: {owners.length}명 중 <strong style={{ color: "#fcd34d", fontSize: "1.2em" }}>{threshold}명</strong> 찬성 시 송금
                </div>
                <ul className={styles.ownerList}>
                  {owners.map((owner, idx) => (
                    <li key={idx} className={owner.toLowerCase() === account.toLowerCase() ? styles.myAccount : ""}>
                      <Key size={14} />
                      <span className={styles.ownerAddr}>{owner}</span>
                      {owner.toLowerCase() === account.toLowerCase() && <span className={styles.meTag}>ME</span>}
                    </li>
                  ))}
                </ul>
                {!isOwner && (
                  <div className={styles.warningBox}>
                    <AlertTriangle size={16} />
                    당신은 이 금고의 소유자가 아닙니다! 결재 권한이 없습니다. (메타마스크에서 계정을 바꿔보세요)
                  </div>
                )}
              </div>

              {isOwner && (
                <div className={styles.actionCard}>
                  <h3>📝 새 송금 기안 올리기</h3>
                  <p>어디로 얼마를 보낼지 작성하여 동업자들에게 결재를 요청합니다.</p>
                  <div className={styles.inputGroup}>
                    <label>받는 사람 주소</label>
                    <input
                      placeholder="0x..."
                      value={toAddress}
                      onChange={e => setToAddress(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>보낼 금액 (ETH)</label>
                    <input
                      type="number"
                      placeholder="예: 0.5"
                      value={amountEth}
                      onChange={e => setAmountEth(e.target.value)}
                    />
                  </div>
                  <button
                    className={styles.submitBtn}
                    onClick={handleSubmit}
                    disabled={isLoading || !toAddress || !amountEth}
                  >
                    <Send size={18} /> 기안 상정 (Submit)
                  </button>
                </div>
              )}
            </div>

            {/* 우측: 트랜잭션 목록 */}
            <div className={styles.rightPanel}>
              <div className={styles.panelTitle}>
                <h3>📋 결재 대기 및 완료 내역</h3>
              </div>

              <div className={styles.txList}>
                {transactions.length === 0 ? (
                  <div className={styles.emptyState}>기안된 송금 내역이 없습니다.</div>
                ) : (
                  transactions.map((tx) => {
                    const isReady = tx.numConfirmations >= threshold;

                    return (
                      <div key={tx.id} className={`${styles.txItem} ${tx.executed ? styles.txExecuted : ""}`}>
                        <div className={styles.txHeader}>
                          <span className={styles.txId}>#{tx.id}</span>
                          <span className={`${styles.statusBadge} ${tx.executed ? styles.statusDone : isReady ? styles.statusReady : styles.statusPending}`}>
                            {tx.executed ? "송금 완료" : isReady ? "실행 대기 (결재 완료)" : "결재 진행 중"}
                          </span>
                        </div>

                        <div className={styles.txBody}>
                          <div className={styles.txRow}><span>To:</span> <code title={tx.to}>{tx.to.substring(0, 12)}...{tx.to.substring(38)}</code></div>
                          <div className={styles.txRow}><span>Amount:</span> <strong>{tx.value} ETH</strong></div>

                          <div className={styles.progressBox}>
                            <div className={styles.progressText}>
                              결재 진행률: {tx.numConfirmations} / {threshold}명
                            </div>
                            <div className={styles.progressBar}>
                              <div
                                className={styles.progressFill}
                                style={{ width: `${Math.min(100, (tx.numConfirmations / threshold) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* 조작 버튼 영역 */}
                        {!tx.executed && isOwner && (
                          <div className={styles.txActions}>
                            {!tx.isConfirmedByMe ? (
                              <button className={styles.confirmBtn} onClick={() => handleConfirm(tx.id)} disabled={isLoading}>
                                <CheckCircle2 size={16} /> 결재 도장 찍기
                              </button>
                            ) : (
                              <button className={styles.revokeBtn} onClick={() => handleRevoke(tx.id)} disabled={isLoading}>
                                <XCircle size={16} /> 도장 회수
                              </button>
                            )}

                            {isReady && (
                              <button className={styles.executeBtn} onClick={() => handleExecute(tx.id)} disabled={isLoading}>
                                <Play size={16} /> 금고에서 송금 실행!
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
