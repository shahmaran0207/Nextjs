"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { PageHeader } from "@/component/PageHeader";

/* ──────────────────────────────────────────────────────────────
   체인 / 토큰 설정
────────────────────────────────────────────────────────────── */
const CHAINS = [
  {
    name: "Chain A",
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:8545",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.35)",
    tokens: [
      { symbol: "ETH",  decimals: 18, address: null },
      { symbol: "USDC", decimals: 6,  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" },
      { symbol: "DAI",  decimals: 18, address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" },
    ],
  },
  {
    name: "Chain B",
    chainId: 1338,
    rpcUrl: "http://127.0.0.1:8546",
    color: "#10b981",
    glow: "rgba(16,185,129,0.35)",
    tokens: [
      { symbol: "ETH",  decimals: 18, address: null },
      { symbol: "USDC", decimals: 6,  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" },
      { symbol: "DAI",  decimals: 18, address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" },
    ],
  },
  {
    name: "Chain C",
    chainId: 1339,
    rpcUrl: "http://127.0.0.1:8547",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.35)",
    tokens: [
      { symbol: "ETH",  decimals: 18, address: null },
      { symbol: "USDC", decimals: 6,  address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" },
      { symbol: "DAI",  decimals: 18, address: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512" },
    ],
  },
];

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

const TOKEN_ICONS: Record<string, string> = {
  ETH:  "⟠",
  USDC: "💵",
  DAI:  "🌼",
};

type TokenBalance = {
  symbol:  string;
  balance: string;
  raw:     bigint;
  decimals: number;
};

type ChainBalances = {
  chainName:  string;
  chainId:    number;
  color:      string;
  glow:       string;
  tokens:     TokenBalance[];
  loading:    boolean;
  error:      string | null;
};

/* ──────────────────────────────────────────────────────────────
   메인 페이지
────────────────────────────────────────────────────────────── */
export default function WalletBalancePage() {
  const [address, setAddress]       = useState("");
  const [inputAddr, setInputAddr]   = useState("");
  const [balances, setBalances]     = useState<ChainBalances[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [useMetaMask, setUseMetaMask] = useState(true); // 메타마스크 사용 여부

  // MetaMask 연결
  const connectMetaMask = async () => {
    if (!(window as any).ethereum) return alert("MetaMask가 설치되어 있지 않습니다.");
    try {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setInputAddr(accounts[0]);
      setAddress(accounts[0]);
    } catch {
      alert("MetaMask 연결 실패");
    }
  };

  // 현재 연결된 체인 ID 확인
  const getCurrentChainId = async (): Promise<number | null> => {
    if (!(window as any).ethereum) return null;
    
    try {
      const chainId = await (window as any).ethereum.request({ method: 'eth_chainId' });
      return parseInt(chainId, 16);
    } catch {
      return null;
    }
  };

  // 메타마스크 체인 전환
  const switchToChain = async (chainId: number) => {
    if (!(window as any).ethereum) return false;
    
    // 현재 체인이 이미 목표 체인인지 확인
    const currentChainId = await getCurrentChainId();
    if (currentChainId === chainId) {
      return true; // 이미 해당 체인에 연결됨
    }
    
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      // 전환 후 실제로 체인이 변경되었는지 확인
      await new Promise(resolve => setTimeout(resolve, 500)); // 잠시 대기
      const newChainId = await getCurrentChainId();
      return newChainId === chainId;
      
    } catch (error: any) {
      console.log(`체인 전환 에러 (${chainId}):`, error);
      
      // 체인이 추가되지 않은 경우 추가 시도
      if (error.code === 4902) {
        const chain = CHAINS.find(c => c.chainId === chainId);
        if (!chain) return false;
        
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
            }],
          });
          
          // 추가 후 다시 전환 시도
          await new Promise(resolve => setTimeout(resolve, 500));
          const newChainId = await getCurrentChainId();
          return newChainId === chainId;
          
        } catch (addError) {
          console.log(`체인 추가 에러 (${chainId}):`, addError);
          return false;
        }
      }
      
      // 사용자가 거부한 경우 (4001) 등
      if (error.code === 4001) {
        return false; // 사용자 거부
      }
      
      return false;
    }
  };

  // 체인별 잔액 조회 (메타마스크 사용)
  const fetchChainBalances = useCallback(async (addr: string): Promise<ChainBalances[]> => {
    const results: ChainBalances[] = [];
    
    for (const chain of CHAINS) {
      const result: ChainBalances = {
        chainName: chain.name,
        chainId:   chain.chainId,
        color:     chain.color,
        glow:      chain.glow,
        tokens:    [],
        loading:   false,
        error:     null,
      };

      try {
        // 메타마스크 사용 옵션이 켜져있고 메타마스크가 있는 경우
        if (useMetaMask && (window as any).ethereum) {
          const currentChainId = await getCurrentChainId();
          
          // 현재 체인과 다른 경우에만 전환 시도
          if (currentChainId !== chain.chainId) {
            const switched = await switchToChain(chain.chainId);
            if (!switched) {
              // 체인 전환 실패 시 직접 RPC로 fallback
              console.log(`체인 전환 실패, RPC로 fallback: ${chain.name}`);
              const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
              const tokenBalances = await Promise.all(
                chain.tokens.map(async (token) => {
                  try {
                    let raw: bigint;
                    if (!token.address) {
                      raw = await provider.getBalance(addr);
                    } else {
                      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                      raw = await contract.balanceOf(addr);
                    }
                    const formatted = parseFloat(ethers.formatUnits(raw, token.decimals));
                    const balance = formatted.toLocaleString("en-US", {
                      maximumFractionDigits: token.decimals === 6 ? 2 : 4,
                    });
                    return { symbol: token.symbol, balance, raw, decimals: token.decimals } as TokenBalance;
                  } catch {
                    return { symbol: token.symbol, balance: "—", raw: BigInt(0), decimals: token.decimals } as TokenBalance;
                  }
                })
              );
              result.tokens = tokenBalances;
              results.push(result);
              continue;
            }
            
            // 전환 후 잠시 대기 (안정성을 위해)
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // 메타마스크 provider 사용
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const tokenBalances = await Promise.all(
            chain.tokens.map(async (token) => {
              try {
                let raw: bigint;
                if (!token.address) {
                  // ETH 네이티브
                  raw = await provider.getBalance(addr);
                } else {
                  // ERC-20
                  const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                  raw = await contract.balanceOf(addr);
                }
                const formatted = parseFloat(ethers.formatUnits(raw, token.decimals));
                const balance = formatted.toLocaleString("en-US", {
                  maximumFractionDigits: token.decimals === 6 ? 2 : 4,
                });
                return { symbol: token.symbol, balance, raw, decimals: token.decimals } as TokenBalance;
              } catch {
                return { symbol: token.symbol, balance: "—", raw: BigInt(0), decimals: token.decimals } as TokenBalance;
              }
            })
          );
          result.tokens = tokenBalances;
        } else {
          // 직접 RPC 사용 (빠른 조회)
          const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
          const tokenBalances = await Promise.all(
            chain.tokens.map(async (token) => {
              try {
                let raw: bigint;
                if (!token.address) {
                  raw = await provider.getBalance(addr);
                } else {
                  const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                  raw = await contract.balanceOf(addr);
                }
                const formatted = parseFloat(ethers.formatUnits(raw, token.decimals));
                const balance = formatted.toLocaleString("en-US", {
                  maximumFractionDigits: token.decimals === 6 ? 2 : 4,
                });
                return { symbol: token.symbol, balance, raw, decimals: token.decimals } as TokenBalance;
              } catch {
                return { symbol: token.symbol, balance: "—", raw: BigInt(0), decimals: token.decimals } as TokenBalance;
              }
            })
          );
          result.tokens = tokenBalances;
        }
      } catch (e: any) {
        result.error = "조회 실패";
      }
      
      results.push(result);
    }
    
    return results;
  }, [useMetaMask]);

  // 조회 실행
  const handleFetch = useCallback(async (addr?: string) => {
    const target = addr ?? address;
    if (!target || !ethers.isAddress(target)) return alert("올바른 지갑 주소를 입력하세요.");
    setRefreshing(true);

    setBalances(CHAINS.map(c => ({
      chainName: c.name, chainId: c.chainId,
      color: c.color, glow: c.glow,
      tokens: [], loading: true, error: null,
    })));

    const result = await fetchChainBalances(target);
    setBalances(result);
    setLastUpdated(new Date());
    setRefreshing(false);
  }, [address, fetchChainBalances]);

  // 주소 확정 (Enter or 버튼)
  const handleAddressSubmit = () => {
    setAddress(inputAddr.trim());
    handleFetch(inputAddr.trim());
  };

  // 자동 새로고침
  useEffect(() => {
    if (!autoRefresh || !address) return;
    const id = setInterval(() => handleFetch(), 15000);
    return () => clearInterval(id);
  }, [autoRefresh, address, handleFetch]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0e1a 0%, #0d1220 50%, #0a0e1a 100%)",
      fontFamily: "'Inter', sans-serif",
      color: "#e2e8f0",
    }}>
      {/* 배경 그리드 */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <PageHeader
          icon="🔭"
          title="지갑 잔액 조회"
          subtitle="ETH · USDC · DAI — 3개 체인 동시 조회"
          navLinks={[
            { href: "/", label: "메인" },
            { href: "/orders", label: "주문내역" },
            { href: "/mypage/crypto-wallet", label: "지갑 등록" },
          ]}
        />

        <main style={{ padding: "0 24px 60px", maxWidth: "1000px", margin: "0 auto" }}>

          {/* ── 주소 입력 카드 ──────────────────────────────── */}
          <div style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "28px",
            backdropFilter: "blur(12px)",
          }}>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "14px" }}>
              <input
                type="text"
                value={inputAddr}
                onChange={e => setInputAddr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddressSubmit()}
                placeholder="지갑 주소 (0x...)"
                style={{
                  flex: 1, minWidth: "280px",
                  padding: "12px 16px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  color: "#e2e8f0", fontSize: "14px",
                  fontFamily: "monospace", outline: "none",
                }}
              />
              <button onClick={handleAddressSubmit} disabled={refreshing} style={{
                padding: "12px 22px", borderRadius: "10px",
                background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                border: "none", color: "#fff", fontWeight: 700,
                fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
                opacity: refreshing ? 0.6 : 1,
              }}>
                {refreshing ? "조회 중..." : "🔍 조회"}
              </button>
              <button onClick={connectMetaMask} style={{
                padding: "12px 20px", borderRadius: "10px",
                background: "rgba(245,158,11,0.15)",
                border: "1px solid rgba(245,158,11,0.4)",
                color: "#fbbf24", fontWeight: 700,
                fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap",
              }}>
                🦊 MetaMask 연결
              </button>
            </div>

            <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#94a3b8" }}>
                <input
                  type="checkbox"
                  checked={useMetaMask}
                  onChange={e => setUseMetaMask(e.target.checked)}
                  style={{ accentColor: "#6366f1", width: "15px", height: "15px" }}
                />
                🦊 MetaMask 체인 전환 사용 (컨펌 필요)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "#94a3b8" }}>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  style={{ accentColor: "#6366f1", width: "15px", height: "15px" }}
                />
                15초 자동 새로고침
              </label>
              {lastUpdated && (
                <span style={{ fontSize: "12px", color: "#475569" }}>
                  마지막 조회: {lastUpdated.toLocaleTimeString("ko-KR")}
                </span>
              )}
              {address && balances.length > 0 && (
                <button onClick={() => handleFetch()} disabled={refreshing} style={{
                  padding: "6px 14px", borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8", fontSize: "12px",
                  cursor: "pointer",
                }}>
                  🔄 새로고침
                </button>
              )}
            </div>
          </div>

          {/* ── 잔액 그리드 ─────────────────────────────────── */}
          {balances.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              {balances.map(chain => (
                <div key={chain.chainId} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${chain.color}40`,
                  borderRadius: "16px",
                  padding: "24px",
                  boxShadow: `0 0 24px ${chain.glow}`,
                  transition: "transform 0.2s",
                }}>
                  {/* 체인 헤더 */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <div>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: chain.color }}>
                        {chain.chainName}
                      </div>
                      <div style={{ fontSize: "11px", color: "#475569", marginTop: "2px" }}>
                        chainId: {chain.chainId}
                      </div>
                    </div>
                    <div style={{
                      width: "10px", height: "10px", borderRadius: "50%",
                      background: chain.error ? "#ef4444" : chain.loading ? "#f59e0b" : "#10b981",
                      boxShadow: `0 0 8px ${chain.error ? "#ef4444" : chain.loading ? "#f59e0b" : "#10b981"}`,
                    }} />
                  </div>

                  {chain.loading ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontSize: "13px" }}>
                      조회 중...
                    </div>
                  ) : chain.error ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "#ef4444", fontSize: "13px" }}>
                      ❌ {chain.error}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      {chain.tokens.map(token => (
                        <div key={token.symbol} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "12px 14px",
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "20px" }}>{TOKEN_ICONS[token.symbol] ?? "🪙"}</span>
                            <span style={{ fontSize: "14px", fontWeight: 600, color: "#cbd5e1" }}>
                              {token.symbol}
                            </span>
                          </div>
                          <div style={{
                            fontSize: "16px", fontWeight: 700,
                            color: token.balance === "0" || token.balance === "0.0000" ? "#475569" : "#e2e8f0",
                            fontFamily: "monospace",
                          }}>
                            {token.balance}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── 초기 안내 ───────────────────────────────────── */}
          {balances.length === 0 && (
            <div style={{
              textAlign: "center", padding: "80px 20px",
              color: "#475569", fontSize: "15px",
            }}>
              <div style={{ fontSize: "56px", marginBottom: "20px" }}>🔭</div>
              <div style={{ fontWeight: 600, color: "#64748b" }}>지갑 주소를 입력하거나 MetaMask를 연결하세요</div>
              <div style={{ fontSize: "13px", marginTop: "8px" }}>
                Chain A / B / C 의 ETH · USDC · DAI 잔액을 한눈에 확인합니다
              </div>
              <div style={{ fontSize: "12px", marginTop: "12px", color: "#475569", lineHeight: "1.4" }}>
                💡 <strong>MetaMask 체인 전환</strong>: 각 체인으로 전환하며 조회 (컨펌 필요)<br/>
                ⚡ <strong>직접 RPC 조회</strong>: 빠른 조회 (컨펌 불필요)
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
