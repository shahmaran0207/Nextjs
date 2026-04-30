"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import styles from "./dao.module.css";
import { PageHeader } from "@/component/PageHeader";
import { Wallet, Plus, CheckCircle, XCircle, Play, Loader2, Users, Clock } from "lucide-react";

interface Proposal {
  id: number;
  proposer: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  deadline: number;
  executed: boolean;
  passed: boolean;
}

export default function DaoDashboard() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [daoContract, setDaoContract] = useState<ethers.Contract | null>(null);
  const [votingPower, setVotingPower] = useState<number>(0);
  
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [newDesc, setNewDesc] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. 메타마스크 연결 및 컨트랙트 초기화
  useEffect(() => {
    initContract();
  }, []);

  const initContract = async () => {
    try {
      // DAO 주소 및 ABI 가져오기
      const res = await fetch("/api/dao/info");
      const daoInfo = await res.json();
      
      if (!daoInfo || !daoInfo.LandDAO) {
        throw new Error("DAO 정보를 불러올 수 없습니다.");
      }

      // 1. 조회용 읽기 전용 컨트랙트 (Ganache 로컬넷 하드코딩)
      // 사용자의 메타마스크 네트워크가 이더리움 메인넷 등 다른 곳이어도 화면(조회)이 터지지 않도록 방어
      const readProvider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const readContract = new ethers.Contract(daoInfo.LandDAO.address, daoInfo.LandDAO.abi, readProvider);
      setDaoContract(readContract);

      // 2. 쓰기용 메타마스크 연동 (선택사항)
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const _provider = new ethers.BrowserProvider((window as any).ethereum);
        setProvider(_provider);

        const accounts = await _provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
        }
      }
    } catch (err) {
      console.error("초기화 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (!provider) return alert("MetaMask가 설치되어 있지 않습니다.");
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (e) {
      console.error(e);
    }
  };

  // 2. 데이터 로드 (투표권 및 제안 목록)
  useEffect(() => {
    if (daoContract) {
      fetchProposals();
      if (account) fetchVotingPower();
    }
  }, [daoContract, account]);

  const fetchVotingPower = async () => {
    if (!daoContract || !account) return;
    try {
      // getVoterInfo(address, 0)을 호출해 투표권 확인 (0번 제안은 없으므로 alreadyVoted는 false 반환)
      const info = await daoContract.getVoterInfo(account, 0);
      setVotingPower(Number(info[0]));
    } catch (err) {
      console.error("투표권 조회 실패:", err);
    }
  };

  const fetchProposals = async () => {
    if (!daoContract) return;
    try {
      const count = await daoContract.proposalCount();
      const countNum = Number(count);
      
      const pList: Proposal[] = [];
      for (let i = countNum; i >= 1; i--) {
        const p = await daoContract.getProposal(i);
        pList.push({
          id: i,
          proposer: p.proposer,
          description: p.description,
          votesFor: Number(p.votesFor),
          votesAgainst: Number(p.votesAgainst),
          deadline: Number(p.deadline),
          executed: p.executed,
          passed: p.passed
        });
      }
      setProposals(pList);
    } catch (err) {
      console.error("제안 목록 조회 실패:", err);
    }
  };

  // 3. 제안 등록
  const handlePropose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!daoContract || !provider) return;
    if (votingPower === 0) return alert("LandNFT가 없으면 제안할 수 없습니다.");
    
    setActionLoading(true);
    try {
      const signer = await provider.getSigner();
      const contractWithSigner = daoContract.connect(signer) as ethers.Contract;
      
      const tx = await contractWithSigner.propose(newDesc);
      await tx.wait(); // 블록 채굴 대기
      
      setNewDesc("");
      fetchProposals();
      alert("제안이 성공적으로 등록되었습니다!");
    } catch (err: any) {
      console.error(err);
      alert("제안 등록 실패: " + (err.reason || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // 4. 투표하기
  const handleVote = async (proposalId: number, support: boolean) => {
    if (!daoContract || !provider) return;
    if (votingPower === 0) return alert("투표권(LandNFT)이 없습니다.");
    
    setActionLoading(true);
    try {
      const signer = await provider.getSigner();
      const contractWithSigner = daoContract.connect(signer) as ethers.Contract;
      
      const tx = await contractWithSigner.vote(proposalId, support);
      await tx.wait();
      
      fetchProposals();
      alert("투표가 완료되었습니다!");
    } catch (err: any) {
      console.error(err);
      alert("투표 실패: " + (err.reason || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  // 4.5 오프체인 투표하기 (가스비 무료 서명)
  const handleVoteOffchain = async (proposalId: number, support: boolean) => {
    if (!account || !provider) return alert("지갑을 먼저 연결해주세요.");
    if (votingPower === 0) return alert("투표권(LandNFT)이 없습니다.");

    setActionLoading(true);
    try {
      const signer = await provider.getSigner();
      
      // 1. 원본 메시지 생성 (백엔드와 토씨 하나 틀리지 않고 똑같아야 함)
      const message = `Vote on Proposal #${proposalId}\nSupport: ${support}`;
      
      // 2. 메타마스크 서명 창 띄우기 (블록체인에 전송하지 않으므로 가스비 0원)
      const signature = await signer.signMessage(message);

      // 3. 백엔드 API로 서명 결과 전송
      const res = await fetch("/api/dao/vote-offchain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId,
          support,
          signature,
          voterAddress: account
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오프체인 투표 실패");

      alert("무료(오프체인) 투표가 성공적으로 완료되었습니다!");
      // TODO: 오프체인 투표수 합산해서 보여주는 로직 추가
    } catch (err: any) {
      console.error(err);
      if (err.code === "ACTION_REJECTED") {
        alert("투표 서명을 취소하셨습니다.");
      } else {
        alert(err.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // 5. 제안 실행
  const handleExecute = async (proposalId: number) => {
    if (!daoContract || !provider) return;
    
    setActionLoading(true);
    try {
      const signer = await provider.getSigner();
      const contractWithSigner = daoContract.connect(signer) as ethers.Contract;
      
      const tx = await contractWithSigner.execute(proposalId);
      await tx.wait();
      
      fetchProposals();
      alert("제안 실행 및 결과 확정이 완료되었습니다!");
    } catch (err: any) {
      console.error(err);
      alert("실행 실패 (투표 기간이 끝나지 않았거나 정족수 미달): " + (err.reason || err.message));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        icon="⚖️"
        title="LandDAO Governance"
        subtitle="LandNFT 소유자들의 자율 운영 투표 대시보드"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/mypage", label: "마이페이지" },
          { href: "/mypage/wallet", label: "내 지갑" },
        ]}
      />

      <div className={styles.container}>
        <div className={styles.mainContent}>
          
          <header className={styles.dashboardHeader}>
            <div className={styles.titleSection}>
              <h1><Users size={28} color="#38bdf8" /> DAO Dashboard</h1>
              <p>스마트 컨트랙트 기반 투명한 의사결정 시스템</p>
            </div>
            
            {account ? (
              <div className={styles.walletInfo}>
                <Wallet size={18} />
                {account.slice(0, 6)}...{account.slice(-4)}
                <span className={styles.powerBadge}>{votingPower} 표 보유 (NFT수)</span>
              </div>
            ) : (
              <button className={styles.connectBtn} onClick={connectWallet}>
                <Wallet size={18} /> MetaMask 연결
              </button>
            )}
          </header>

          <div className={styles.contentGrid}>
            
            {/* 좌측: 제안 목록 */}
            <div className={styles.proposalsSection}>
              <h2 className={styles.cardTitle}>📜 활성 제안 목록</h2>
              
              {loading ? (
                <div className={styles.emptyState}>
                  <Loader2 className="animate-spin" style={{ margin: "0 auto 10px" }} />
                  스마트 컨트랙트 로딩 중...
                </div>
              ) : proposals.length === 0 ? (
                <div className={styles.emptyState}>
                  아직 등록된 거버넌스 제안이 없습니다.
                </div>
              ) : (
                <div className={styles.proposalsList}>
                  {proposals.map(p => {
                    const now = Math.floor(Date.now() / 1000);
                    const isClosed = now > p.deadline;
                    const totalVotes = p.votesFor + p.votesAgainst;
                    const forPercent = totalVotes > 0 ? (p.votesFor / totalVotes) * 100 : 0;
                    const againstPercent = totalVotes > 0 ? (p.votesAgainst / totalVotes) * 100 : 0;
                    
                    return (
                      <div key={p.id} className={styles.proposalCard}>
                        <div className={styles.proposalHeader}>
                          <span className={styles.proposalId}># {p.id}</span>
                          {p.executed ? (
                            <span className={`${styles.proposalStatus} ${p.passed ? styles.statusPassed : styles.statusFailed}`}>
                              {p.passed ? "✅ 가결됨" : "❌ 부결됨"}
                            </span>
                          ) : isClosed ? (
                            <span className={`${styles.proposalStatus} ${styles.statusActive}`} style={{ color: "#f59e0b", borderColor: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                              투표 종료 (결과 대기)
                            </span>
                          ) : (
                            <span className={`${styles.proposalStatus} ${styles.statusActive}`}>
                              투표 진행중
                            </span>
                          )}
                        </div>
                        
                        <h3 className={styles.proposalDesc}>{p.description}</h3>
                        
                        <div className={styles.voteBarContainer}>
                          <div className={styles.voteLabels}>
                            <span className={styles.labelFor}>찬성 {p.votesFor}표</span>
                            <span className={styles.labelAgainst}>반대 {p.votesAgainst}표</span>
                          </div>
                          <div className={styles.voteBar}>
                            <div className={styles.voteBarFor} style={{ width: `${forPercent}%` }}></div>
                            <div className={styles.voteBarAgainst} style={{ width: `${againstPercent}%` }}></div>
                          </div>
                        </div>
                        
                        <div className={styles.metaInfo}>
                          <span><Clock size={14} /> 마감: {new Date(p.deadline * 1000).toLocaleString()}</span>
                          <span><Users size={14} /> 발의자: {p.proposer.slice(0, 6)}...</span>
                        </div>

                        {/* 액션 버튼 */}
                        {!p.executed && (
                          <div className={styles.actionButtons} style={{ flexWrap: 'wrap' }}>
                            {!isClosed ? (
                              <>
                                {/* 기존 유료 온체인 투표 */}
                                <button className={`${styles.voteBtn} ${styles.btnFor}`} disabled={actionLoading} onClick={() => handleVote(p.id, true)}>
                                  <CheckCircle size={16} /> 온체인 찬성 (유료)
                                </button>
                                <button className={`${styles.voteBtn} ${styles.btnAgainst}`} disabled={actionLoading} onClick={() => handleVote(p.id, false)}>
                                  <XCircle size={16} /> 온체인 반대 (유료)
                                </button>
                                
                                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '5px 0' }}></div>
                                
                                {/* 새로운 무료 오프체인 서명 투표 */}
                                <button className={`${styles.voteBtn}`} style={{ background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }} disabled={actionLoading} onClick={() => handleVoteOffchain(p.id, true)}>
                                  <CheckCircle size={16} /> 오프체인 찬성 서명 (무료)
                                </button>
                                <button className={`${styles.voteBtn}`} style={{ background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', borderColor: 'rgba(244, 63, 94, 0.3)' }} disabled={actionLoading} onClick={() => handleVoteOffchain(p.id, false)}>
                                  <XCircle size={16} /> 오프체인 반대 서명 (무료)
                                </button>
                              </>
                            ) : (
                              <button className={styles.executeBtn} disabled={actionLoading} onClick={() => handleExecute(p.id)}>
                                <Play size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} /> 
                                결과 확정 (Execute)
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 우측: 새 제안 등록 패널 */}
            <div className={styles.createSection}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>새 제안 등록</h2>
                <form onSubmit={handlePropose}>
                  <div className={styles.inputGroup}>
                    <label>안건 내용</label>
                    <textarea 
                      className={styles.textarea}
                      placeholder="예: 강남구 디지털 트윈 데이터 접근 권한을 외부 기업에게 개방합니다."
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={styles.submitBtn} 
                    disabled={actionLoading || !newDesc.trim() || votingPower === 0}
                  >
                    {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    제안하기
                  </button>
                  {votingPower === 0 && (
                    <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "10px", textAlign: "center" }}>
                      제안하려면 NFT가 최소 1개 이상 필요합니다.
                    </p>
                  )}
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
