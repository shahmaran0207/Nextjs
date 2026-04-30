"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Banknote, ShieldAlert, ArrowDownCircle, ArrowUpCircle, Skull, Activity, Settings2 } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./Lending.module.css";

export default function LendingPage() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [oracleContract, setOracleContract] = useState<ethers.Contract | null>(null);
  const [tokenContract, setTokenContract] = useState<ethers.Contract | null>(null);
  const [lendingData, setLendingData] = useState<any>(null);

  // 유저 상태
  const [ethBalance, setEthBalance] = useState("0");
  const [tokenBalance, setTokenBalance] = useState("0");
  const [collateralETH, setCollateralETH] = useState("0");
  const [borrowedUSDC, setBorrowedUSDC] = useState("0");
  const [collateralValueUSD, setCollateralValueUSD] = useState("0");
  
  // 시스템/오라클 상태
  const [ethPrice, setEthPrice] = useState("0");
  const [bankLiquidity, setBankLiquidity] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  // 입력폼
  const [depositAmount, setDepositAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [oraclePriceInput, setOraclePriceInput] = useState("");
  const [targetUser, setTargetUser] = useState("");

  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask 설치 필요"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);
      setTargetUser(accounts[0]); // 기본 청산 타겟을 본인으로 설정 (테스트용)

      const res = await fetch("/api/lending");
      const data = await res.json();
      setLendingData(data);

      const lContract = new ethers.Contract(data.lendingAddress, data.lendingAbi, signer);
      const oContract = new ethers.Contract(data.oracleAddress, data.oracleAbi, signer);
      const tContract = new ethers.Contract(data.tokenAddress, data.tokenAbi, signer);
      
      setContract(lContract);
      setOracleContract(oContract);
      setTokenContract(tContract);

      await fetchState(lContract, oContract, tContract, accounts[0], provider);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchState = async (c: ethers.Contract, o: ethers.Contract, t: ethers.Contract, user: string, provider: any) => {
    try {
      // 1. ETH 가격 가져오기
      const roundData = await o.latestRoundData();
      const price = Number(roundData.answer) / 1e8;
      setEthPrice(price.toString());

      // 2. 유저 지갑 잔고
      const bal = await provider.getBalance(user);
      setEthBalance(Number(ethers.formatEther(bal)).toFixed(4));
      
      const tBal = await t.balanceOf(user);
      setTokenBalance(ethers.formatEther(tBal));

      // 3. 렌딩 프로토콜 내 유저 상태
      const cETH = await c.collateralETH(user);
      setCollateralETH(ethers.formatEther(cETH));
      
      const bToken = await c.borrowedToken(user);
      setBorrowedUSDC(ethers.formatEther(bToken));

      const cValue = await c.getCollateralValueInUSD(user);
      setCollateralValueUSD((Number(cValue) / 1e8).toFixed(2));

      // 4. 은행 금고 잔액 (유동성)
      const bankBal = await t.balanceOf(await c.getAddress());
      setBankLiquidity(ethers.formatEther(bankBal));

    } catch (err) {
      console.error("상태 업데이트 실패", err);
    }
  };

  const refresh = async () => {
    if (contract && oracleContract && tokenContract && account) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await fetchState(contract, oracleContract, tokenContract, account, provider);
    }
  };

  // 담보 예치
  const handleDeposit = async () => {
    if (!contract || !depositAmount) return;
    setIsLoading(true);
    try {
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      alert("✅ 담보 예치 성공!");
      setDepositAmount("");
      refresh();
    } catch (e: any) { alert("예치 실패: " + e.message); }
    finally { setIsLoading(false); }
  };

  // 대출
  const handleBorrow = async () => {
    if (!contract || !borrowAmount) return;
    setIsLoading(true);
    try {
      const tx = await contract.borrow(ethers.parseEther(borrowAmount));
      await tx.wait();
      alert(`✅ 대출 성공! ${borrowAmount} USDC가 지갑으로 들어왔습니다.`);
      setBorrowAmount("");
      refresh();
    } catch (e: any) { alert("대출 실패 (한도 초과 확인): " + e.message); }
    finally { setIsLoading(false); }
  };

  // 상환
  const handleRepay = async () => {
    if (!contract || !tokenContract || !repayAmount) return;
    setIsLoading(true);
    try {
      const amountWei = ethers.parseEther(repayAmount);
      // 토큰 컨트랙트에 승인(Approve) 먼저 해야 함
      const approveTx = await tokenContract.approve(await contract.getAddress(), amountWei);
      await approveTx.wait();
      
      const tx = await contract.repay(amountWei);
      await tx.wait();
      alert("✅ 상환 성공!");
      setRepayAmount("");
      refresh();
    } catch (e: any) { alert("상환 실패: " + e.message); }
    finally { setIsLoading(false); }
  };

  // 강제 청산
  const handleLiquidate = async () => {
    if (!contract || !tokenContract || !targetUser) return;
    setIsLoading(true);
    try {
      // 청산 대상이 빌린 금액 확인
      const debt = await contract.borrowedToken(targetUser);
      // 청산자(나)가 대신 갚아주기 위해 Approve
      const approveTx = await tokenContract.approve(await contract.getAddress(), debt);
      await approveTx.wait();

      const tx = await contract.liquidate(targetUser);
      await tx.wait();
      alert("💥 청산 성공! 유저의 빚을 갚고 담보물(ETH)을 통째로 압수했습니다.");
      refresh();
    } catch (e: any) { alert("청산 실패 (유저가 아직 안전함): " + e.message); }
    finally { setIsLoading(false); }
  };

  // [관리자 전용] 오라클 가격 강제 조작
  const handleUpdatePrice = async () => {
    if (!oracleContract || !oraclePriceInput) return;
    setIsLoading(true);
    try {
      // 8 decimals 추가
      const newPrice = BigInt(oraclePriceInput) * BigInt(100000000);
      const tx = await oracleContract.updateAnswer(newPrice);
      await tx.wait();
      alert(`⚠️ 오라클 조작 완료: ETH 가격이 $${oraclePriceInput}(으)로 변경되었습니다!`);
      refresh();
    } catch (e: any) { alert("가격 조작 실패: " + e.message); }
    finally { setIsLoading(false); }
  };

  // 계산
  const collateralUsdVal = Number(collateralValueUSD);
  const borrowedVal = Number(borrowedUSDC);
  const maxBorrow = collateralUsdVal * 0.7; // LTV 70%
  const liqThreshold = collateralUsdVal * 0.8; // 청산 80%
  
  let healthFactor = 100;
  if (borrowedVal > 0) {
    // 담보가치의 80% (청산점) 대비 빌린 돈의 비율
    healthFactor = (borrowedVal / liqThreshold) * 100; 
  }

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🏦"
        title="디파이 대출 및 청산 (Lending Protocol)"
        subtitle="전당포처럼 ETH를 담보로 맡기고 달러(USDC)를 빌리는 탈중앙화 은행"
        navLinks={[{ href: "/", label: "메인으로" }]}
      />

      <main className={styles.mainContent}>
        {!account ? (
          <div className={styles.centerBox}>
            <Banknote size={48} color="#3b82f6" />
            <h2>대출 서비스를 이용하려면 지갑을 연결하세요</h2>
            <button className={styles.connectBtn} onClick={connectWallet}>
              <Wallet size={20} /> MetaMask 연결
            </button>
          </div>
        ) : (
          <div className={styles.dashboard}>
            
            {/* 좌측: 은행 이용 (예치/대출) */}
            <div className={styles.leftPanel}>
              
              {/* 내 계좌 상태 */}
              <div className={styles.accountCard}>
                <div className={styles.cardHeader}>
                  <h3>💰 내 대출 계좌 상태</h3>
                  <button onClick={refresh} className={styles.refreshBtn}><Activity size={16}/></button>
                </div>
                
                <div className={styles.balanceGrid}>
                  <div className={styles.balBox}>
                    <span className={styles.bLabel}>내 지갑 잔고 (ETH)</span>
                    <span className={styles.bValue}>{ethBalance}</span>
                  </div>
                  <div className={styles.balBox}>
                    <span className={styles.bLabel}>내 지갑 잔고 (USDC)</span>
                    <span className={styles.bValue}>{Number(tokenBalance).toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.statusRow}>
                  <div className={styles.sCol}>
                    <span>담보 예치금 (ETH)</span>
                    <strong>{Number(collateralETH).toFixed(4)} ETH</strong>
                    <small>≈ ${collateralValueUSD}</small>
                  </div>
                  <div className={styles.sCol}>
                    <span>대출 잔액 (USDC)</span>
                    <strong style={{color:"#ef4444"}}>{Number(borrowedUSDC).toFixed(2)} USDC</strong>
                    <small>한도: ${maxBorrow.toFixed(2)} (70%)</small>
                  </div>
                </div>

                <div className={styles.healthContainer}>
                  <div className={styles.healthHeader}>
                    <span>건전성(Health Factor)</span>
                    <span style={{color: healthFactor > 90 ? "#ef4444" : "#10b981"}}>{healthFactor.toFixed(2)}%</span>
                  </div>
                  <div className={styles.healthBar}>
                    <div 
                      className={styles.healthFill} 
                      style={{ 
                        width: `${Math.min(100, healthFactor)}%`,
                        background: healthFactor > 95 ? "#ef4444" : healthFactor > 80 ? "#f59e0b" : "#10b981"
                      }}
                    ></div>
                    <div className={styles.healthMarker} style={{left:"100%"}} title="청산선(100%)"></div>
                  </div>
                  <div className={styles.healthDesc}>
                    * 100%를 초과하면(대출금이 담보가치의 80% 돌파) 강제 청산됩니다.
                  </div>
                </div>
              </div>

              {/* 액션 폼 */}
              <div className={styles.actionGrid}>
                {/* 예치 폼 */}
                <div className={styles.actionCard}>
                  <h4>1. 담보 예치하기</h4>
                  <div className={styles.inputWrap}>
                    <input type="number" placeholder="예치할 ETH 수량" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} />
                    <span>ETH</span>
                  </div>
                  <button className={styles.btnBlue} onClick={handleDeposit} disabled={isLoading || !depositAmount}>
                    <ArrowDownCircle size={18}/> 예치(Deposit)
                  </button>
                </div>

                {/* 대출 폼 */}
                <div className={styles.actionCard}>
                  <h4>2. 대출 받기</h4>
                  <div className={styles.inputWrap}>
                    <input type="number" placeholder="빌릴 달러 수량" value={borrowAmount} onChange={e=>setBorrowAmount(e.target.value)} />
                    <span>USDC</span>
                  </div>
                  <button className={styles.btnGreen} onClick={handleBorrow} disabled={isLoading || !borrowAmount}>
                    <ArrowUpCircle size={18}/> 대출(Borrow)
                  </button>
                </div>

                {/* 상환 폼 */}
                <div className={styles.actionCard} style={{gridColumn: "1 / -1"}}>
                  <h4>3. 대출금 갚기</h4>
                  <div className={styles.inputWrap}>
                    <input type="number" placeholder="갚을 달러 수량" value={repayAmount} onChange={e=>setRepayAmount(e.target.value)} />
                    <span>USDC</span>
                  </div>
                  <button className={styles.btnGray} onClick={handleRepay} disabled={isLoading || !repayAmount}>
                    상환(Repay) 및 지갑 권한(Approve) 허용
                  </button>
                </div>
              </div>

            </div>

            {/* 우측: 오라클 및 청산 */}
            <div className={styles.rightPanel}>
              
              <div className={styles.oracleCard}>
                <div className={styles.oHeader}>
                  <Settings2 size={20} color="#8b5cf6" />
                  <h3>체인링크 가격 피드 (Oracle)</h3>
                </div>
                <div className={styles.priceDisplay}>
                  1 ETH = <strong>${ethPrice}</strong>
                </div>
                <div className={styles.adminBox}>
                  <label>🚨 [관리자] 가격 폭락 시뮬레이션</label>
                  <div className={styles.flexBox}>
                    <input type="number" placeholder="새로운 ETH 가격 (예: 500)" value={oraclePriceInput} onChange={e=>setOraclePriceInput(e.target.value)} />
                    <button onClick={handleUpdatePrice} disabled={isLoading}>적용</button>
                  </div>
                  <p>이더리움 가격을 낮춰서 대출 건전성을 악화시켜 보세요.</p>
                </div>
              </div>

              <div className={styles.liquidationCard}>
                <div className={styles.lHeader}>
                  <Skull size={24} color="#ef4444" />
                  <h3>헌터들의 강제 청산 (Liquidation)</h3>
                </div>
                <p>다른 유저의 건전성이 100%를 초과(담보가치 폭락)했을 때, 내가 대신 빚을 갚아주고 담보물을 싹쓸이할 수 있습니다.</p>
                
                <div className={styles.liqInput}>
                  <label>청산할 타겟 유저 주소</label>
                  <input type="text" value={targetUser} onChange={e=>setTargetUser(e.target.value)} />
                </div>
                
                <button className={styles.btnRed} onClick={handleLiquidate} disabled={isLoading || !targetUser}>
                  💥 즉시 강제 청산 실행! (대신 갚고 뺏기)
                </button>
              </div>

              <div className={styles.infoCard}>
                <h4>🏦 프로토콜 정보</h4>
                <ul>
                  <li>스마트 컨트랙트 주소: <code>{lendingData?.lendingAddress.substring(0,10)}...</code></li>
                  <li>은행 보유 유동성: <strong>{Number(bankLiquidity).toLocaleString()} USDC</strong></li>
                  <li>최대 LTV (대출 한도): <strong>70%</strong></li>
                  <li>청산 기준 (Threshold): <strong>80%</strong></li>
                </ul>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
