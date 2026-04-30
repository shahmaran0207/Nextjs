"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Wallet, Droplet, CheckCircle2, XCircle, RefreshCw, Lock, Unlock, Gift } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./DeFiDashboard.module.css"; // 프리미엄 디자인 전용 CSS

export default function DeFiDashboard() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("0.0");
  const [stakedBalance, setStakedBalance] = useState<string>("0.0");
  const [earnedReward, setEarnedReward] = useState<string>("0.0"); // Phase 3: 쌓인 이자
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [stakingContract, setStakingContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [stakeAmount, setStakeAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // 1. 지갑 연결 및 컨트랙트 초기화
  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("메타마스크를 설치해주세요!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);

      // 서버 API에서 배포된 컨트랙트 주소와 설명서(ABI) 가져오기
      const res = await fetch("/api/defi/info");
      if (!res.ok) throw new Error("컨트랙트 정보를 불러올 수 없습니다.");
      const deployInfo = await res.json();

      const tokenContract = new ethers.Contract(deployInfo.address, deployInfo.abi, signer);
      setContract(tokenContract);

      // Staking 컨트랙트 정보 가져오기
      const stakingRes = await fetch("/api/defi/staking");
      if (!stakingRes.ok) throw new Error("Staking 정보를 불러올 수 없습니다.");
      const stakingInfo = await stakingRes.json();
      
      const stakingInstance = new ethers.Contract(stakingInfo.address, stakingInfo.abi, signer);
      setStakingContract(stakingInstance);

      // 잔액 조회 실행
      await fetchBalance(tokenContract, stakingInstance, accounts[0]);
    } catch (err) {
      console.error(err);
      alert("지갑 연결에 실패했습니다.");
    }
  };

  // 2. 내 잔액 + 예치금 + 이자 조회 함수
  const fetchBalance = async (tokenContract: ethers.Contract, stakingInst: ethers.Contract | null, userAddress: string) => {
    try {
      const rawBalance = await tokenContract.balanceOf(userAddress);
      setBalance(ethers.formatEther(rawBalance));

      if (stakingInst) {
        const rawStaked = await stakingInst.stakingBalance(userAddress);
        setStakedBalance(ethers.formatEther(rawStaked));

        // Phase 3: earned() 함수로 현재 쌓인 이자 조회
        const rawEarned = await stakingInst.earned(userAddress);
        setEarnedReward(ethers.formatEther(rawEarned));
      }
    } catch (err) {
      console.error("잔액 조회 실패:", err);
    }
  };

  // 3. 100 코인 무료 받기 (Faucet)
  const handleFaucet = async () => {
    if (!contract || !account) return;
    
    setIsLoading(true);
    try {
      const tx = await contract.faucet();
      await tx.wait();
      alert("🎉 100 RWD 코인을 성공적으로 받았습니다!");
      await fetchBalance(contract, stakingContract, account);
    } catch (err) {
      console.error(err);
      alert("코인 발급에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 4. 예치하기 (Approve + Stake)
  const handleStake = async () => {
    if (!contract || !stakingContract || !account || !stakeAmount) return;
    
    setIsLoading(true);
    try {
      const amountWei = ethers.parseEther(stakeAmount);
      const stakingAddress = await stakingContract.getAddress();

      // 1단계: Approve (코인 본체에게 은행이 내 돈 빼가는 걸 허락)
      console.log("Approve 진행 중...");
      const approveTx = await contract.approve(stakingAddress, amountWei);
      await approveTx.wait();

      // 2단계: Stake (은행 금고에 예치)
      console.log("Stake 진행 중...");
      const stakeTx = await stakingContract.stake(amountWei);
      await stakeTx.wait();

      alert("✅ 성공적으로 예치되었습니다!");
      setStakeAmount("");
      await fetchBalance(contract, stakingContract, account);
    } catch (err) {
      console.error(err);
      alert("예치 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. 인출하기 (Withdraw)
  const handleWithdraw = async () => {
    if (!contract || !stakingContract || !account || !withdrawAmount) return;
    
    setIsLoading(true);
    try {
      const amountWei = ethers.parseEther(withdrawAmount);
      
      const withdrawTx = await stakingContract.withdraw(amountWei);
      await withdrawTx.wait();

      alert("✅ 성공적으로 인출되었습니다!");
      setWithdrawAmount("");
      await fetchBalance(contract, stakingContract, account);
    } catch (err) {
      console.error(err);
      alert("인출 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Phase 3: 쌓인 이자 수령하기 (getReward)
  const handleGetReward = async () => {
    if (!stakingContract || !account) return;
    
    setIsLoading(true);
    try {
      const rewardTx = await stakingContract.getReward();
      await rewardTx.wait();

      alert("🎁 이자를 성공적으로 수령했습니다!");
      await fetchBalance(contract!, stakingContract, account);
    } catch (err) {
      console.error(err);
      alert("이자 수령 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // Phase 3: 5초마다 쌓이는 이자를 자동 새로고침
  // Ganache는 트랜잭션 없이 시간이 멈추므로, Ganache RPC에 직접 evm_mine을 보내 블록을 강제 생성
  useEffect(() => {
    if (!stakingContract || !account || !contract) return;
    const interval = setInterval(async () => {
      try {
        // MetaMask를 거치지 않고, Ganache RPC에 직접 요청 (테스트 전용 메서드)
        await fetch("http://127.0.0.1:8545", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "evm_mine", params: [], id: 1 }),
        });
      } catch (_) {
        // 로컬 환경이 아닐 때는 무시
      }
      fetchBalance(contract, stakingContract, account);
    }, 5000);
    return () => clearInterval(interval);
  }, [contract, stakingContract, account]);

  // 계정 변경 감지
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) fetchBalance(contract, stakingContract, accounts[0]);
        } else {
          setAccount("");
          setBalance("0.0");
          setStakedBalance("0.0");
          setEarnedReward("0.0");
        }
      });
    }
  }, [contract, stakingContract]);

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🏦"
        title="DeFi Staking Dashboard"
        subtitle="Phase 3: 예치 → 이자 자동 지급 → 수령까지 완성된 DeFi 뱅크"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/mypage", label: "마이페이지" },
        ]}
      />

      <main className={styles.mainContent}>
        <div className={styles.glassCard}>
          
          <div className={styles.cardHeader}>
            <div className={styles.title}>
              <Wallet className={styles.titleIcon} size={28} />
              <span>블록체인 지갑 상태</span>
            </div>
            
            {account ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className={styles.walletBadge}>
                  <CheckCircle2 size={18} />
                  {account.slice(0, 6)}...{account.slice(-4)}
                </div>
                <button className={styles.reconnectBtn} onClick={connectWallet}>
                  <RefreshCw size={16} /> 재연결
                </button>
              </div>
            ) : (
              <div className={`${styles.walletBadge} ${styles.disconnected}`}>
                <XCircle size={18} /> 연결 안 됨
              </div>
            )}
          </div>

          {/* 내 지갑 잔액 */}
          <div className={styles.balanceContainer}>
            <div className={styles.balanceLabel}>내 지갑 잔액 (Reward Token)</div>
            <div className={styles.balanceAmount}>
              {balance} <span className={styles.balanceCurrency}>RWD</span>
            </div>
            {!account && (
              <button 
                className={styles.faucetBtn} 
                style={{ margin: "20px auto 0" }}
                onClick={connectWallet}
              >
                <Wallet size={20} /> MetaMask 연결하기
              </button>
            )}
          </div>

          {/* 예치금 + 이자 섹션 */}
          <div className={styles.stakingSection}>
            {/* 예치금 & 이자 현황 2열 */}
            <div className={styles.stakingGrid}>
              <div className={styles.stakingBox}>
                <div className={styles.balanceLabel} style={{ color: '#34d399', fontSize: '0.85rem' }}>현재 금고 예치금</div>
                <div className={styles.balanceAmount} style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #34d399, #10b981)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  {stakedBalance} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>RWD</span>
                </div>
              </div>
              <div className={styles.stakingBox}>
                <div className={styles.balanceLabel} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>⏱ 쌓인 이자 (5초 자동갱신)</div>
                <div className={styles.balanceAmount} style={{ fontSize: '2.5rem', background: 'linear-gradient(to right, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                  {parseFloat(earnedReward).toFixed(4)} <span style={{ fontSize: '1rem', color: '#94a3b8' }}>RWD</span>
                </div>
                <button
                  className={styles.actionBtn}
                  style={{ marginTop: '12px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}
                  disabled={!account || isLoading || parseFloat(earnedReward) <= 0}
                  onClick={handleGetReward}
                >
                  <Gift size={16} style={{ display: 'inline', marginRight: '6px' }} />
                  {isLoading ? "처리 중..." : "이자 수령하기"}
                </button>
              </div>
            </div>

            {/* 예치 / 인출 */}
            <div className={styles.stakingGrid} style={{ marginTop: '20px' }}>
              <div className={styles.stakingBox}>
                <h4><Lock size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> 예치하기 (Stake)</h4>
                <div className={styles.inputGroup}>
                  <input 
                    type="number" 
                    className={styles.amountInput}
                    placeholder="예치할 수량 입력" 
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                  <button 
                    className={styles.actionBtn}
                    disabled={!account || isLoading || !stakeAmount}
                    onClick={handleStake}
                  >
                    {isLoading ? "처리 중..." : "예치 승인 및 실행"}
                  </button>
                </div>
              </div>

              <div className={styles.stakingBox}>
                <h4><Unlock size={18} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> 인출하기 (Withdraw)</h4>
                <div className={styles.inputGroup}>
                  <input 
                    type="number" 
                    className={styles.amountInput}
                    placeholder="인출할 수량 입력" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <button 
                    className={`${styles.actionBtn} ${styles.withdrawBtn}`}
                    disabled={!account || isLoading || !withdrawAmount}
                    onClick={handleWithdraw}
                  >
                    {isLoading ? "처리 중..." : "예치금 인출하기"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Faucet */}
          <div className={styles.faucetSection}>
            <div className={styles.faucetInfo}>
              <h4>스테이킹용 초기 자본금 (Faucet)</h4>
              <p>은행에 예치할 돈이 없으신가요?<br/>아래 버튼을 눌러 테스트넷 전용 RWD 토큰 100개를 발급받으세요.</p>
            </div>
            <button 
              className={styles.faucetBtn}
              onClick={handleFaucet}
              disabled={!account || isLoading}
            >
              {isLoading ? (
                <><RefreshCw size={22} className={styles.spinner} /> 발급 진행 중...</>
              ) : (
                <><Droplet size={22} /> 100 RWD 발급받기</>
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
