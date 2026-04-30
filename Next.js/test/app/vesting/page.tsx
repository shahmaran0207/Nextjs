"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Clock, Lock, Unlock, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./Vesting.module.css";

export default function VestingPage() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [vestingData, setVestingData] = useState<any>(null);
  
  // 컨트랙트 상태
  const [releasedAmount, setReleasedAmount] = useState(0);
  const [releasableAmount, setReleasableAmount] = useState(0);
  const [vestedAmount, setVestedAmount] = useState(0);
  const [totalLocked, setTotalLocked] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask 설치 필요"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);

      const res = await fetch("/api/vesting");
      const data = await res.json();
      setVestingData(data);

      const vestingContract = new ethers.Contract(data.vestingAddress, data.vestingAbi, signer);
      setContract(vestingContract);

      await fetchState(vestingContract, data.lockAmount);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchState = async (c: ethers.Contract, initialLock: string) => {
    try {
      // 블록체인에서 계산된 값들 가져오기
      const released = await c.released();
      const releasable = await c.releasableAmount();
      const vested = await c.vestedAmount();
      
      setReleasedAmount(Number(ethers.formatEther(released)));
      setReleasableAmount(Number(ethers.formatEther(releasable)));
      setVestedAmount(Number(ethers.formatEther(vested)));
      setTotalLocked(Number(ethers.formatEther(initialLock)));

      // 현재 블록체인 상의 시간을 대략적으로 알기 위해 로컬 시간 활용 (초 단위)
      setCurrentTime(Math.floor(Date.now() / 1000));
    } catch (err) {
      console.error("데이터 조회 실패", err);
    }
  };

  // 1초마다 화면 갱신 (시간의 흐름에 따라 락업이 풀리는 걸 시각적으로 보여주기 위함)
  useEffect(() => {
    if (!contract || !vestingData) return;
    const interval = setInterval(() => {
      fetchState(contract, vestingData.lockAmount);
    }, 1000);
    return () => clearInterval(interval);
  }, [contract, vestingData]);

  // 락업 풀린 토큰 인출하기
  const handleRelease = async () => {
    if (!contract) return;
    setIsLoading(true);
    try {
      const tx = await contract.release();
      await tx.wait();
      alert(`🎉 성공! ${releasableAmount.toFixed(2)} TKA가 팀 지갑으로 입금되었습니다.`);
      if (vestingData) fetchState(contract, vestingData.lockAmount);
    } catch (err: any) {
      if (err.message.includes("No tokens are ready")) {
        alert("아직 출금할 수 있는 토큰이 없습니다. 절벽(Cliff) 기간이 지나길 기다려주세요!");
      } else {
        alert("출금 실패: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 시간 및 퍼센트 계산
  const start = vestingData?.startTimestamp || 0;
  const cliff = start + (vestingData?.cliffDuration || 0);
  const end = start + (vestingData?.totalDuration || 0);
  
  const now = currentTime;
  let progressPercent = 0;
  if (now >= end) progressPercent = 100;
  else if (now > start) progressPercent = ((now - start) / (end - start)) * 100;

  const isCliffPassed = now >= cliff;
  const isBeneficiary = account.toLowerCase() === vestingData?.beneficiary.toLowerCase();

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="⏳"
        title="토큰 베스팅 (Token Vesting)"
        subtitle="투자자 보호를 위해 개발팀 물량을 컨트랙트에 묶어두고 서서히 푸는 시스템"
        navLinks={[{ href: "/", label: "메인으로" }]}
      />

      <main className={styles.mainContent}>
        {!account ? (
          <div className={styles.centerBox}>
            <Lock size={48} color="#ec4899" />
            <h2>팀 물량 락업 상태를 보려면 지갑을 연결하세요</h2>
            <button className={styles.connectBtn} onClick={connectWallet}>
              <Wallet size={20} /> MetaMask 연결
            </button>
          </div>
        ) : (
          <div className={styles.dashboard}>
            
            {/* 좌측: 타임라인 및 정보 */}
            <div className={styles.leftPanel}>
              <div className={styles.infoCard}>
                <h3>📋 스마트 컨트랙트 규약</h3>
                <div className={styles.ruleBox}>
                  <p><strong>총 락업 물량:</strong> {totalLocked.toLocaleString()} TKA</p>
                  <p><strong>수혜자(개발팀):</strong> <code>{vestingData?.beneficiary.substring(0,8)}...</code> {isBeneficiary && <span className={styles.meTag}>내 계정</span>}</p>
                </div>
                
                <div className={styles.timeline}>
                  <div className={`${styles.timeNode} ${now >= start ? styles.active : ""}`}>
                    <div className={styles.nodeIcon}>🚀</div>
                    <div className={styles.nodeText}>
                      <strong>프로젝트 시작 (Start)</strong>
                      <span>단 1개도 뺄 수 없음</span>
                    </div>
                  </div>
                  
                  <div className={styles.timeLineBar}>
                    <div className={styles.timeLineFill} style={{ height: `${Math.min(100, ((now - start) / (cliff - start)) * 100)}%` }}></div>
                  </div>

                  <div className={`${styles.timeNode} ${isCliffPassed ? styles.active : ""}`}>
                    <div className={styles.nodeIcon}>⛰️</div>
                    <div className={styles.nodeText}>
                      <strong>절벽 통과 (Cliff)</strong>
                      <span>이때부터 선형 분배 시작 (+1분)</span>
                    </div>
                  </div>

                  <div className={styles.timeLineBar}>
                    <div className={styles.timeLineFill} style={{ height: `${isCliffPassed ? Math.min(100, ((now - cliff) / (end - cliff)) * 100) : 0}%` }}></div>
                  </div>

                  <div className={`${styles.timeNode} ${now >= end ? styles.active : ""}`}>
                    <div className={styles.nodeIcon}>🔓</div>
                    <div className={styles.nodeText}>
                      <strong>100% 락업 해제 완료</strong>
                      <span>(+5분)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측: 게이지 바 및 출금 */}
            <div className={styles.rightPanel}>
              <div className={styles.statusCard}>
                <div className={styles.cardHeader}>
                  <h3>💧 실시간 락업 해제 현황</h3>
                  <div className={styles.liveIndicator}>
                    <div className={styles.pulse}></div>
                    실시간 동기화 중
                  </div>
                </div>

                {!isCliffPassed ? (
                  <div className={styles.cliffWarning}>
                    <AlertCircle size={24} color="#f59e0b" />
                    <h4>현재 절벽(Cliff) 기간입니다</h4>
                    <p>아직 아무도 토큰을 인출할 수 없습니다. 투자자는 안심하셔도 됩니다.</p>
                  </div>
                ) : (
                  <div className={styles.vestingActive}>
                    <TrendingUp size={24} color="#10b981" />
                    <h4>락업 해제 진행 중!</h4>
                    <p>스마트 컨트랙트의 수학적 계산에 의해 초당 토큰이 풀리고 있습니다.</p>
                  </div>
                )}

                {/* 대형 프로그레스 바 */}
                <div className={styles.bigProgressContainer}>
                  <div className={styles.progressHeader}>
                    <span>전체 진행률</span>
                    <span>{progressPercent.toFixed(2)}%</span>
                  </div>
                  <div className={styles.bigProgressBar}>
                    <div className={styles.bigProgressFill} style={{ width: `${progressPercent}%` }}></div>
                    {/* 절벽 위치 표시선 */}
                    <div className={styles.cliffMarker} style={{ left: `${((cliff - start) / (end - start)) * 100}%` }} title="절벽(Cliff) 위치"></div>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>총 풀린 물량 (Vested)</span>
                    <span className={styles.statValue}>{vestedAmount.toFixed(2)}</span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>이미 빼간 물량 (Released)</span>
                    <span className={styles.statValue}>{releasedAmount.toFixed(2)}</span>
                  </div>
                  <div className={`${styles.statBox} ${styles.highlightBox}`}>
                    <span className={styles.statLabel}>지금 출금 가능 (Releasable)</span>
                    <span className={styles.statValueHighlight}>{releasableAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.actionSection}>
                  {!isBeneficiary ? (
                    <div className={styles.notOwnerMsg}>
                      ※ 당신은 개발팀(수혜자) 계정이 아닙니다. 출금 권한이 없습니다.
                    </div>
                  ) : (
                    <button 
                      className={styles.claimBtn} 
                      onClick={handleRelease}
                      disabled={isLoading || releasableAmount <= 0}
                    >
                      {releasableAmount <= 0 ? (
                        <><Lock size={18} /> 출금 가능한 토큰 없음</>
                      ) : (
                        <><Unlock size={18} /> {releasableAmount.toFixed(2)} TKA 출금하기</>
                      )}
                    </button>
                  )}
                </div>

              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
