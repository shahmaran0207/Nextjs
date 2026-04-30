"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Wallet, CheckCircle2, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./Oracle.module.css";

type PriceHistory = { price: string; time: string; change: number };

export default function OraclePage() {
  const [account, setAccount] = useState("");
  const [currentPrice, setCurrentPrice] = useState("—");
  const [rawPrice, setRawPrice] = useState("—");
  const [decimals, setDecimals] = useState(8);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [newPrice, setNewPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 컨트랙트 인스턴스
  const [consumer, setConsumer] = useState<ethers.Contract | null>(null);
  const [mockFeed, setMockFeed] = useState<ethers.Contract | null>(null);

  // 지갑 연결
  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask를 설치해주세요!"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts  = await provider.send("eth_requestAccounts", []);
      const signer    = await provider.getSigner();
      setAccount(accounts[0]);

      const oracleInfo = await fetch("/api/oracle").then(r => r.json());

      // PriceFeedConsumer 컨트랙트
      const consumerContract = new ethers.Contract(
        oracleInfo.consumerAddress,
        oracleInfo.abi,
        signer
      );

      // MockV3Aggregator 컨트랙트 (가격 변경용)
      const mockContract = new ethers.Contract(
        oracleInfo.mockFeedAddress,
        oracleInfo.mockAbi,
        signer
      );

      setConsumer(consumerContract);
      setMockFeed(mockContract);

      await fetchPrice(consumerContract);
    } catch (err) {
      console.error(err);
      alert("지갑 연결 실패");
    }
  };

  // 현재 가격 조회
  const fetchPrice = useCallback(async (c?: ethers.Contract) => {
    const target = c ?? consumer;
    if (!target) return;
    try {
      const raw       = await target.getLatestPrice();  // int256, 8자리
      const formatted = await target.getFormattedPrice(); // uint256, 1e18
      const dec       = await target.getDecimals();

      const priceInDollars = parseFloat(ethers.formatEther(formatted)).toFixed(2);
      setCurrentPrice(priceInDollars);
      setRawPrice(raw.toString());
      setDecimals(Number(dec));

      // 히스토리 추가
      setPriceHistory(prev => {
        const prevPrice = prev.length > 0 ? parseFloat(prev[prev.length - 1].price) : 0;
        const curr = parseFloat(priceInDollars);
        const change = prevPrice > 0 ? ((curr - prevPrice) / prevPrice) * 100 : 0;
        const next: PriceHistory = {
          price: priceInDollars,
          time: new Date().toLocaleTimeString("ko-KR"),
          change,
        };
        return [...prev.slice(-9), next];
      });
    } catch (err) {
      console.error("가격 조회 실패:", err);
    }
  }, [consumer]);

  // 가격 업데이트 (Mock 전용)
  const updatePrice = async () => {
    if (!mockFeed || !newPrice || parseFloat(newPrice) <= 0) return;
    setIsLoading(true);
    try {
      // 달러 → 8자리 소수점 정수 변환
      const priceIn8Decimals = BigInt(Math.round(parseFloat(newPrice) * 1e8));
      await (await mockFeed.updateAnswer(priceIn8Decimals)).wait();
      alert(`✅ ETH 가격이 $${newPrice}로 업데이트됐습니다!`);
      setNewPrice("");
      await fetchPrice();
    } catch (err) {
      console.error(err);
      alert("가격 업데이트 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const lastChange = priceHistory.length > 1
    ? priceHistory[priceHistory.length - 1]?.change ?? 0
    : 0;
  const isUp = lastChange >= 0;

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🔮"
        title="Chainlink Oracle"
        subtitle="실세계 데이터를 블록체인에 — MockV3Aggregator 실습"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/defi", label: "DeFi" },
          { href: "/dex", label: "DEX" },
        ]}
      />

      <main className={styles.mainContent}>

        {/* 지갑 연결 */}
        <div className={styles.walletRow}>
          {account ? (
            <>
              <div className={styles.walletBadge}>
                <CheckCircle2 size={16} />
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
              <button className={styles.refreshBtn} onClick={() => fetchPrice()}>
                <RefreshCw size={16} /> 새로고침
              </button>
            </>
          ) : (
            <button className={styles.connectBtn} onClick={connectWallet}>
              <Wallet size={18} /> MetaMask 연결
            </button>
          )}
        </div>

        {/* 오라클 흐름 다이어그램 */}
        <div className={styles.flowDiagram}>
          <div className={styles.flowNode}>
            <span className={styles.flowIcon}>🌐</span>
            <span className={styles.flowLabel}>실세계<br/>(Binance 등)</span>
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowNode}>
            <span className={styles.flowIcon}>🔗</span>
            <span className={styles.flowLabel}>Chainlink<br/>노드들</span>
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={`${styles.flowNode} ${styles.flowNodeActive}`}>
            <span className={styles.flowIcon}>📋</span>
            <span className={styles.flowLabel}>Aggregator<br/>(중앙값 계산)</span>
          </div>
          <div className={styles.flowArrow}>→</div>
          <div className={styles.flowNode}>
            <span className={styles.flowIcon}>📜</span>
            <span className={styles.flowLabel}>우리<br/>컨트랙트</span>
          </div>
          <div className={styles.mockBadge}>⚠️ 로컬 = MockV3Aggregator 사용 중</div>
        </div>

        <div className={styles.grid}>

          {/* ── 현재 가격 카드 ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📈 ETH / USD 현재 가격</h2>

            <div className={styles.priceDisplay}>
              <span className={styles.priceSymbol}>$</span>
              <span className={`${styles.priceValue} ${isUp ? styles.priceUp : styles.priceDown}`}>
                {currentPrice}
              </span>
              {lastChange !== 0 && (
                <span className={`${styles.priceChange} ${isUp ? styles.up : styles.down}`}>
                  {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(lastChange).toFixed(2)}%
                </span>
              )}
            </div>

            <div className={styles.rawInfo}>
              <div className={styles.rawRow}>
                <span>rawPrice (Solidity 반환값)</span>
                <code>{rawPrice}</code>
              </div>
              <div className={styles.rawRow}>
                <span>소수점 자리수</span>
                <code>{decimals} 자리</code>
              </div>
              <div className={styles.rawRow}>
                <span>실제 달러 변환</span>
                <code>rawPrice ÷ 10^{decimals} = ${currentPrice}</code>
              </div>
            </div>

            <div className={styles.sourceInfo}>
              <p>📍 데이터 출처: <strong>MockV3Aggregator</strong> (로컬 개발용)</p>
              <p>🌐 실제 환경: Chainlink ETH/USD Aggregator</p>
              <p>🔑 함수: <code>latestRoundData()</code> → <code>answer</code> 필드</p>
            </div>
          </div>

          {/* ── 가격 시뮬레이터 ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🎛️ 오라클 가격 시뮬레이터</h2>
            <p className={styles.cardDesc}>
              실제 Chainlink 환경에서는 노드들이 자동으로 업데이트하지만,
              로컬에서는 <strong>MockV3Aggregator.updateAnswer()</strong>를
              직접 호출해서 가격을 바꿀 수 있습니다.
            </p>

            <div className={styles.presetRow}>
              {[1000, 2000, 3000, 4000, 5000].map(p => (
                <button
                  key={p}
                  className={styles.presetBtn}
                  onClick={() => setNewPrice(p.toString())}
                >
                  ${p.toLocaleString()}
                </button>
              ))}
            </div>

            <div className={styles.inputGroup}>
              <label>새 ETH 가격 (달러)</label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  className={styles.priceInput}
                  placeholder="예: 3500"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                />
              </div>
            </div>

            {newPrice && (
              <div className={styles.conversionBox}>
                <p>📐 Solidity 저장 값 계산:</p>
                <code>
                  ${newPrice} × 10^8 = {(parseFloat(newPrice || "0") * 1e8).toFixed(0)}
                </code>
                <p className={styles.conversionNote}>
                  → updateAnswer({(parseFloat(newPrice || "0") * 1e8).toFixed(0)}) 호출
                </p>
              </div>
            )}

            <button
              className={styles.updateBtn}
              disabled={!account || isLoading || !newPrice || parseFloat(newPrice) <= 0}
              onClick={updatePrice}
            >
              {isLoading ? (
                <><RefreshCw size={18} className={styles.spinner} /> 업데이트 중...</>
              ) : (
                "🔮 Oracle 가격 업데이트"
              )}
            </button>
          </div>
        </div>

        {/* ── 가격 히스토리 ── */}
        {priceHistory.length > 0 && (
          <div className={styles.historyCard}>
            <h2 className={styles.cardTitle}>📊 가격 변동 히스토리</h2>
            <div className={styles.historyTable}>
              <div className={styles.historyHeader}>
                <span>시각</span>
                <span>ETH/USD 가격</span>
                <span>변동률</span>
              </div>
              {[...priceHistory].reverse().map((item, i) => (
                <div key={i} className={styles.historyRow}>
                  <span className={styles.historyTime}>{item.time}</span>
                  <span className={styles.historyPrice}>${item.price}</span>
                  <span className={`${styles.historyChange} ${item.change >= 0 ? styles.up : styles.down}`}>
                    {item.change === 0 ? "—" : `${item.change >= 0 ? "▲" : "▼"} ${Math.abs(item.change).toFixed(2)}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
