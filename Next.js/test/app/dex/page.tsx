"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Wallet, CheckCircle2, XCircle, RefreshCw, ArrowUpDown, Droplet } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./DEX.module.css";

export default function DEXPage() {
  const [account, setAccount] = useState("");
  const [rwdBalance, setRwdBalance] = useState("0.0");
  const [tkaBalance, setTkaBalance] = useState("0.0");
  const [reserveA, setReserveA] = useState("0.0"); // 풀 내 RWD
  const [reserveB, setReserveB] = useState("0.0"); // 풀 내 TKA
  const [price, setPrice] = useState("0.0");       // TKA 1개당 RWD 가격
  const [isLoading, setIsLoading] = useState(false);

  // 스왑 방향: true = RWD→TKA, false = TKA→RWD
  const [directionAtoB, setDirectionAtoB] = useState(true);
  const [amountIn, setAmountIn] = useState("");
  const [estimatedOut, setEstimatedOut] = useState("0.0");

  // 컨트랙트 인스턴스
  const [rwd, setRwd] = useState<ethers.Contract | null>(null);
  const [tka, setTka] = useState<ethers.Contract | null>(null);
  const [amm, setAmm] = useState<ethers.Contract | null>(null);

  // 1. 지갑 연결
  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask를 설치해주세요!"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);

      const [rwdInfo, tkaInfo, ammInfo] = await Promise.all([
        fetch("/api/defi/info").then(r => r.json()),
        fetch("/api/dex/tokenA").then(r => r.json()),
        fetch("/api/dex/amm").then(r => r.json()),
      ]);

      const rwdContract = new ethers.Contract(rwdInfo.address, rwdInfo.abi, signer);
      const tkaContract = new ethers.Contract(tkaInfo.address, tkaInfo.abi, signer);
      const ammContract = new ethers.Contract(ammInfo.address, ammInfo.abi, signer);

      setRwd(rwdContract);
      setTka(tkaContract);
      setAmm(ammContract);

      await fetchAll(rwdContract, tkaContract, ammContract, accounts[0]);
    } catch (err) {
      console.error(err);
      alert("지갑 연결 실패");
    }
  };

  // 2. 잔액 + 풀 상태 새로고침
  const fetchAll = async (
    rwdC: ethers.Contract, tkaC: ethers.Contract,
    ammC: ethers.Contract, addr: string
  ) => {
    try {
      const [rwdBal, tkaBal, reserves, priceRaw] = await Promise.all([
        rwdC.balanceOf(addr),
        tkaC.balanceOf(addr),
        ammC.getReserves(),
        ammC.getPriceAinB(),
      ]);
      setRwdBalance(parseFloat(ethers.formatEther(rwdBal)).toFixed(4));
      setTkaBalance(parseFloat(ethers.formatEther(tkaBal)).toFixed(4));
      setReserveA(parseFloat(ethers.formatEther(reserves[0])).toFixed(4));
      setReserveB(parseFloat(ethers.formatEther(reserves[1])).toFixed(4));
      setPrice(parseFloat(ethers.formatEther(priceRaw)).toFixed(4));
    } catch (err) {
      console.error("조회 실패:", err);
    }
  };

  // 3. 입력값 변경 시 예상 수령량 계산
  useEffect(() => {
    if (!amm || !amountIn || parseFloat(amountIn) <= 0) {
      setEstimatedOut("0.0");
      return;
    }
    const calculate = async () => {
      try {
        const resA = ethers.parseEther(reserveA);
        const resB = ethers.parseEther(reserveB);
        const inAmt = ethers.parseEther(amountIn);
        const out = await amm.getAmountOut(
          inAmt,
          directionAtoB ? resA : resB,
          directionAtoB ? resB : resA
        );
        setEstimatedOut(parseFloat(ethers.formatEther(out)).toFixed(6));
      } catch {
        setEstimatedOut("0.0");
      }
    };
    calculate();
  }, [amountIn, directionAtoB, amm, reserveA, reserveB]);

  // 4. 스왑 실행
  const handleSwap = async () => {
    if (!amm || !rwd || !tka || !account || !amountIn) return;
    setIsLoading(true);
    try {
      const inWei  = ethers.parseEther(amountIn);
      const outWei = ethers.parseEther(estimatedOut);
      // 슬리피지 1% 허용
      const minOut = outWei * 99n / 100n;

      if (directionAtoB) {
        // RWD → TKA
        const ammAddr = await amm.getAddress();
        await (await rwd.approve(ammAddr, inWei)).wait();
        await (await amm.swapAforB(inWei, minOut)).wait();
      } else {
        // TKA → RWD
        const ammAddr = await amm.getAddress();
        await (await tka.approve(ammAddr, inWei)).wait();
        await (await amm.swapBforA(inWei, minOut)).wait();
      }

      alert("✅ 스왑 완료!");
      setAmountIn("");
      setEstimatedOut("0.0");
      await fetchAll(rwd, tka, amm, account);
    } catch (err) {
      console.error(err);
      alert("스왑 중 오류 발생");
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Faucet
  const handleFaucet = async (token: "RWD" | "TKA") => {
    if (!rwd || !tka) return;
    setIsLoading(true);
    try {
      const c = token === "RWD" ? rwd : tka;
      await (await c.faucet()).wait();
      alert(`🎉 ${token} 발급 완료!`);
      await fetchAll(rwd, tka, amm!, account);
    } catch (err) {
      console.error(err);
      alert("Faucet 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 방향 전환
  const toggleDirection = () => {
    setDirectionAtoB(prev => !prev);
    setAmountIn("");
    setEstimatedOut("0.0");
  };

  const tokenIn  = directionAtoB ? "RWD" : "TKA";
  const tokenOut = directionAtoB ? "TKA" : "RWD";
  const balanceIn = directionAtoB ? rwdBalance : tkaBalance;

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🔄"
        title="DEX — SimpleAMM"
        subtitle="Phase 2: x × y = k 공식 기반 탈중앙 거래소"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/defi", label: "DeFi 스테이킹" },
        ]}
      />

      <main className={styles.mainContent}>

        {/* 지갑 연결 헤더 */}
        <div className={styles.walletRow}>
          {account ? (
            <>
              <div className={styles.walletBadge}>
                <CheckCircle2 size={16} />
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              <button className={styles.refreshBtn} onClick={() => fetchAll(rwd!, tka!, amm!, account)}>
                <RefreshCw size={16} /> 새로고침
              </button>
            </>
          ) : (
            <button className={styles.connectBtn} onClick={connectWallet}>
              <Wallet size={18} /> MetaMask 연결
            </button>
          )}
        </div>

        <div className={styles.grid}>

          {/* ── 왼쪽: 풀 현황 ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📊 유동성 풀 현황</h2>

            <div className={styles.poolStats}>
              <div className={styles.poolToken}>
                <span className={styles.tokenSymbol}>RWD</span>
                <span className={styles.tokenAmount}>{reserveA}</span>
                <span className={styles.tokenLabel}>풀 보유량</span>
              </div>
              <div className={styles.poolDivider}>×</div>
              <div className={styles.poolToken}>
                <span className={styles.tokenSymbol}>TKA</span>
                <span className={styles.tokenAmount}>{reserveB}</span>
                <span className={styles.tokenLabel}>풀 보유량</span>
              </div>
            </div>

            <div className={styles.kValue}>
              <span>k = {reserveA !== "0.0" ? (parseFloat(reserveA) * parseFloat(reserveB)).toFixed(0) : "—"}</span>
              <span className={styles.kLabel}>x × y = k (항상 일정)</span>
            </div>

            <div className={styles.priceRow}>
              <div className={styles.priceBox}>
                <span className={styles.priceLabel}>TKA 1개 가격</span>
                <span className={styles.priceValue}>{price} <span className={styles.priceCurrency}>RWD</span></span>
              </div>
              <div className={styles.priceBox}>
                <span className={styles.priceLabel}>RWD 1개 가격</span>
                <span className={styles.priceValue}>
                  {price !== "0.0" ? (1 / parseFloat(price)).toFixed(4) : "0.0"}
                  <span className={styles.priceCurrency}> TKA</span>
                </span>
              </div>
            </div>

            {/* 내 잔액 */}
            <div className={styles.balanceSection}>
              <h3>💼 내 지갑 잔액</h3>
              <div className={styles.balanceRow}>
                <span>RWD</span>
                <span>{rwdBalance}</span>
                <button className={styles.faucetMini} onClick={() => handleFaucet("RWD")} disabled={!account || isLoading}>
                  <Droplet size={13} /> Faucet
                </button>
              </div>
              <div className={styles.balanceRow}>
                <span>TKA</span>
                <span>{tkaBalance}</span>
                <button className={styles.faucetMini} onClick={() => handleFaucet("TKA")} disabled={!account || isLoading}>
                  <Droplet size={13} /> Faucet
                </button>
              </div>
            </div>
          </div>

          {/* ── 오른쪽: 스왑 ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🔄 토큰 교환 (Swap)</h2>

            {/* 방향 표시 */}
            <div className={styles.swapDirection}>
              <span className={styles.swapToken}>{tokenIn}</span>
              <button className={styles.swapArrowBtn} onClick={toggleDirection} title="방향 전환">
                <ArrowUpDown size={20} />
              </button>
              <span className={styles.swapToken}>{tokenOut}</span>
            </div>

            {/* 입력 */}
            <div className={styles.inputGroup}>
              <label>넣을 {tokenIn} 수량</label>
              <div className={styles.inputWrapper}>
                <input
                  type="number"
                  className={styles.amountInput}
                  placeholder={`예: 100`}
                  value={amountIn}
                  onChange={e => setAmountIn(e.target.value)}
                />
                <button
                  className={styles.maxBtn}
                  onClick={() => setAmountIn(balanceIn.replace(",", ""))}
                >MAX</button>
              </div>
            </div>

            {/* 예상 수령량 */}
            <div className={styles.outputBox}>
              <span className={styles.outputLabel}>받을 {tokenOut} 예상량</span>
              <span className={styles.outputAmount}>{estimatedOut}</span>
              <span className={styles.outputNote}>슬리피지 1% 허용</span>
            </div>

            {/* 스왑 버튼 */}
            <button
              className={styles.swapBtn}
              disabled={!account || isLoading || !amountIn || parseFloat(amountIn) <= 0}
              onClick={handleSwap}
            >
              {isLoading ? (
                <><RefreshCw size={18} className={styles.spinner} /> 처리 중...</>
              ) : (
                `${tokenIn} → ${tokenOut} 교환하기`
              )}
            </button>

            {/* 수식 설명 */}
            {amountIn && parseFloat(amountIn) > 0 && (
              <div className={styles.formula}>
                <p>📐 계산 공식</p>
                <code>
                  out = ({directionAtoB ? reserveB : reserveA} × {amountIn}) ÷ ({directionAtoB ? reserveA : reserveB} + {amountIn})
                </code>
                <code>≈ {estimatedOut} {tokenOut}</code>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
