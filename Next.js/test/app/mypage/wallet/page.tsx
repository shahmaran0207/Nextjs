"use client";

import React, { useEffect, useState } from "react";
import styles from "./Wallet.module.css";
import { Package, Heart, Star, Award, Map, Truck, Lock, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/component/PageHeader";
import { ethers } from "ethers";

interface MapCoupon {
  id: number;
  discount: number;
  timestamp: string;
}

export default function GamificationWallet() {
  const [mapCoupons, setMapCoupons] = useState<MapCoupon[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  // ── 블록체인 지갑 및 히스토리 상태 ──
  const [account, setAccount] = useState<string | null>(null);
  const [chains, setChains] = useState<any[]>([]);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [transferLogs, setTransferLogs] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // 페이지 마운트 시 메타마스크 연결 여부 자동 감지
    const checkWallet = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        } catch (e) {
          console.error("지갑 감지 실패:", e);
        }
      }
    };
    checkWallet();
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      alert("MetaMask가 설치되어 있지 않습니다.");
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (e) {
      console.error("지갑 연결 실패:", e);
    }
  };

  useEffect(() => {
    // 1. 지도 쿠폰 로드 (localStorage)
    const stored = localStorage.getItem("mapCoupons");
    if (stored) {
      try {
        setMapCoupons(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse map coupons", e);
      }
    }

    // 2. 통계 데이터 패치
    fetch("/api/mypage/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
      })
      .catch(console.error);

    // 3. 결제 서버에서 체인/토큰 정보 가져오기 (히스토리 스캔용)
    fetch("http://localhost:3001/api/crypto/chains")
      .then(res => res.json())
      .then(data => {
        setChains(data.chains);
        if (data.chains.length > 0) {
          // 첫 번째 체인 중 주소가 있는(ERC-20) 토큰을 기본값으로 선택
          const firstERC20 = data.chains.flatMap((c: any) => c.tokens).find((t: any) => t.address);
          if (firstERC20) setSelectedToken(firstERC20);
        }
      })
      .catch(console.error);
  }, []);

  // ── 블록체인 이벤트 스캐닝 로직 ──
  const scanTransactionHistory = async () => {
    if (!account || !selectedToken) return;
    setIsScanning(true);
    setTransferLogs([]);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // 1. 우리가 찾고자 하는 이벤트의 형태(ABI)를 정의합니다.
      const ERC20_ABI = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
      const contract = new ethers.Contract(selectedToken.address, ERC20_ABI, provider);

      // 2. 필터(Filter) 생성
      // 내가 '받은' 내역 (to == account)
      const filterToMe = contract.filters.Transfer(null, account);
      // 내가 '보낸' 내역 (from == account) - 방금 쇼핑몰 결제에 쓴 내역이 여기에 속합니다!
      const filterFromMe = contract.filters.Transfer(account, null);

      // 3. 과거 블록부터 최신 블록까지 두 가지 필터 모두 검색 (queryFilter)
      const [logsToMe, logsFromMe] = await Promise.all([
        contract.queryFilter(filterToMe, 0, "latest"),
        contract.queryFilter(filterFromMe, 0, "latest")
      ]);

      // 합치기 및 중복 제거 (내가 나한테 보낸 경우 중복될 수 있으므로 TxHash 기준으로 제거)
      const allLogs = [...logsToMe, ...logsFromMe];
      const uniqueLogs = Array.from(new globalThis.Map(allLogs.map(log => [log.transactionHash, log])).values());

      // 4. 찾은 로그 데이터를 UI에 맞게 파싱
      const parsedLogs = await Promise.all(uniqueLogs.map(async (log: any) => {
        const block = await provider.getBlock(log.blockNumber);
        const fromAddress = log.args[0];
        const isSent = fromAddress.toLowerCase() === account.toLowerCase();

        return {
          transactionHash: log.transactionHash,
          type: isSent ? "OUT" : "IN",
          from: log.args[0],
          to: log.args[1],
          value: ethers.formatUnits(log.args[2], selectedToken.decimals),
          timestamp: block?.timestamp ? new Date(block.timestamp * 1000).toLocaleString() : "알 수 없음",
          blockNumber: log.blockNumber
        };
      }));

      // 시간순(블록번호순) 최신이 위로 오게 정렬
      parsedLogs.sort((a, b) => b.blockNumber - a.blockNumber);
      setTransferLogs(parsedLogs);
    } catch (e) {
      console.error("이벤트 스캔 실패:", e);
      alert("이벤트 스캔 중 오류가 발생했습니다. (네트워크 연결을 확인하세요)");
    } finally {
      setIsScanning(false);
    }
  };

  if (!stats) {
    return <div className={styles.loading}>Loading your wallet...</div>;
  }

  // 업적 달성 여부 계산
  const achievements = [
    {
      id: 1,
      title: "디지털 트윈 입문자",
      desc: "지도에서 1개 이상의 쿠폰을 획득했습니다.",
      icon: <Map size={24} />,
      unlocked: mapCoupons.length >= 1
    },
    {
      id: 2,
      title: "트럭 관제사",
      desc: "주문 내역이 1건 이상 존재합니다.",
      icon: <Truck size={24} />,
      unlocked: stats.orderCount >= 1
    },
    {
      id: 3,
      title: "쿠폰 헌터 마스터",
      desc: "지도에서 3개 이상의 쿠폰을 획득했습니다.",
      icon: <Award size={24} />,
      unlocked: mapCoupons.length >= 3
    },
    {
      id: 4,
      title: "플래티넘 쇼퍼",
      desc: "누적 50만원 이상 구매하셨습니다.",
      icon: <Star size={24} />,
      unlocked: stats.totalSpent >= 500000
    }
  ];

  return (
    <>
      <PageHeader
        icon="👜"
        title="My Gamification Wallet"
        subtitle="나만의 쇼핑 & 트윈맵 활동 내역을 확인하세요."

        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/mypage", label: "마이페이지" },
        ]}
      />

      <div className={styles.container}>

        {/* 요약 통계 영역 */}
        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Package /></div>
            <div>
              <h3>{stats.orderCount}</h3>
              <p>총 주문 건수</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Heart /></div>
            <div>
              <h3>{stats.wishlistCount}</h3>
              <p>위시리스트</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}><Star /></div>
            <div>
              <h3>{stats.reviewCount}</h3>
              <p>작성한 리뷰</p>
            </div>
          </div>
        </section>

        {/* 홀로그램 쿠폰 지갑 영역 */}
        <section className={styles.walletSection}>
          <div className={styles.sectionHeader}>
            <h2>🎫 맵 획득 쿠폰 지갑</h2>
            <span className={styles.badge}>{mapCoupons.length}개 보유</span>
          </div>

          {mapCoupons.length === 0 ? (
            <div className={styles.emptyState}>
              디지털 트윈 맵에서 배송 트럭을 관제하고 숨겨진 쿠폰을 찾아보세요!
            </div>
          ) : (
            <div className={styles.couponGrid}>
              {mapCoupons.map((coupon, idx) => (
                <div key={coupon.id} className={styles.couponCard} style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className={styles.couponHologram}></div>
                  <div className={styles.couponContent}>
                    <h4>Special Map Coupon</h4>
                    <div className={styles.discountText}>{coupon.discount}% OFF</div>
                    <div className={styles.couponDate}>
                      획득일: {new Date(coupon.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 업적 (Achievements) 시스템 */}
        <section className={styles.achievementsSection}>
          <h2>🏆 나의 업적 뱃지</h2>
          <div className={styles.achievementGrid}>
            {achievements.map(ach => (
              <div key={ach.id} className={`${styles.achievementCard} ${ach.unlocked ? styles.unlocked : styles.locked}`}>
                <div className={styles.achievementIcon}>
                  {ach.unlocked ? ach.icon : <Lock size={24} />}
                </div>
                <div className={styles.achievementInfo}>
                  <h4>{ach.title}</h4>
                  <p>{ach.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 최근 주문 내역 */}
        <section className={styles.recentOrders}>
          <h2>📦 최근 주문 내역</h2>
          {recentOrders.length === 0 ? (
            <p className={styles.emptyText}>아직 주문 내역이 없습니다.</p>
          ) : (
            <div className={styles.orderList}>
              {recentOrders.map(order => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderHeader}>
                    <span className={styles.orderNo}>{order.order_number}</span>
                    <span className={`${styles.statusBadge} ${styles[order.order_status.toLowerCase()]}`}>
                      {order.order_status}
                    </span>
                  </div>
                  <div className={styles.orderBody}>
                    결제 금액: <strong>₩{Number(order.final_amount).toLocaleString()}</strong>
                    <br />
                    <span className={styles.orderDate}>{new Date(order.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 블록체인 온체인 송금 내역 ── */}
        <section className={styles.recentOrders} style={{ marginTop: "2rem" }}>
          <h2>🔗 블록체인 온체인 송금 내역</h2>

          {!account ? (
            <div className={styles.emptyState}>
              <p style={{ marginBottom: "1rem" }}>MetaMask를 연결하여 스마트 컨트랙트에서 전송(Transfer) 이벤트를 스캔하세요.</p>
              <button
                onClick={connectWallet}
                style={{
                  background: "#f6851b",
                  color: "#fff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "0 auto"
                }}
              >
                <Wallet size={18} /> MetaMask 연결하기
              </button>
            </div>
          ) : (
            <div className={styles.orderList}>
              <p style={{ padding: "1rem", background: "rgba(34, 197, 94, 0.1)", color: "#22c55e", borderRadius: "8px", wordBreak: "break-all" }}>
                <strong>연결된 지갑:</strong> {account}
              </p>

              <div style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                <h4 style={{ marginBottom: "1rem", color: "#e2e8f0" }}>🔍 스캔할 토큰 선택</h4>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <select
                    style={{ padding: "10px", borderRadius: "8px", background: "#0f172a", color: "#fff", border: "1px solid #334155", flex: 1 }}
                    value={selectedToken?.address || ""}
                    onChange={(e) => {
                      // 모든 체인을 뒤져서 선택된 토큰 객체를 찾음
                      const found = chains.flatMap(c => Object.values(c.tokens)).find((t: any) => t.address === e.target.value);
                      if (found) setSelectedToken(found);
                    }}
                  >
                    {chains.map(chain => (
                      <optgroup key={chain.chainId} label={chain.name}>
                        {Object.values(chain.tokens).filter((t: any) => t.address).map((token: any) => (
                          <option key={token.address} value={token.address}>
                            {token.symbol} ({token.address.slice(0, 6)}...{token.address.slice(-4)})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <button
                    onClick={scanTransactionHistory}
                    disabled={isScanning}
                    style={{
                      background: isScanning ? "#64748b" : "#3b82f6",
                      color: "#fff",
                      border: "none",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontWeight: "bold",
                      cursor: isScanning ? "not-allowed" : "pointer",
                    }}
                  >
                    {isScanning ? "스캔 중..." : "과거 내역 스캔하기"}
                  </button>
                </div>
              </div>

              {/* 스캔 결과 출력 영역 */}
              {transferLogs.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <h4 style={{ marginBottom: "1rem", color: "#e2e8f0" }}>📜 토큰 송수신 내역 ({transferLogs.length}건)</h4>
                  {transferLogs.map((log, idx) => (
                    <div key={idx} style={{ background: "#0f172a", border: "1px solid #334155", padding: "1rem", borderRadius: "8px", marginBottom: "10px", fontSize: "0.9rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ color: log.type === "IN" ? "#3b82f6" : "#ef4444", fontWeight: "bold" }}>
                          {log.type === "IN" ? "+" : "-"}{log.value} {selectedToken?.symbol}
                        </span>
                        <span style={{ color: "#94a3b8" }}>{log.timestamp}</span>
                      </div>
                      <div style={{ color: "#64748b", fontSize: "0.8rem", wordBreak: "break-all" }}>
                        <strong>{log.type === "IN" ? "보낸 사람:" : "받는 사람:"}</strong> {log.type === "IN" ? log.from : log.to}<br />
                        <strong>Tx Hash:</strong> {log.transactionHash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
