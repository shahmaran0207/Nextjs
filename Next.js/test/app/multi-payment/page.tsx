"use client";

import { useState, useEffect } from "react";
import { ethers }              from "ethers";
import { useRouter }           from "next/navigation";
import styles                  from "./page.module.css";
import { PageHeader }          from "@/component/PageHeader";
import { useAuthGuard }        from "../hooks/useAuthGuard";
import { useSearchParams }     from "next/navigation";

// ── 결제 서버 주소 ────────────────────────────────────────────────
const PAYMENT_SERVER = "http://localhost:3001";

// ── 타입 ─────────────────────────────────────────────────────────
interface TokenInfo {
  symbol:   string;
  decimals: number;
  address:  string | null; // null = ETH native
}

interface ChainInfo {
  name:            string;
  chainId:         number;
  rpcUrl:          string;
  paymentReceiver: string;
  tokens:          TokenInfo[];
}

// 결제 진행 단계
// 0=대기  1=주문생성  2=네트워크전환  3=approve(ERC-20)  4=결제서명  5=확인대기  6=완료
type PayStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const STEP_LABELS: Record<PayStep, string> = {
  0: "대기",
  1: "주문 생성 중...",
  2: "네트워크 전환 중...",
  3: "토큰 승인(approve) 중...",
  4: "결제 서명 중...",
  5: "블록체인 확인 대기 중...",
  6: "결제 완료!",
};

// ERC-20 최소 ABI (approve + allowance + balanceOf)
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
];

export default function MultiPaymentPage() {
  const searchParams   = useSearchParams();
  const sellerIdParam  = searchParams.get("sellerId");
  const productIdParam = searchParams.get("productId");
  const router         = useRouter();

  const { email } = useAuthGuard();

  // ── 체인/토큰 설정 (서버에서 로드) ────────────────────────────
  const [chains, setChains]           = useState<ChainInfo[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  // ── 사용자 선택 ────────────────────────────────────────────────
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [amount, setAmount]               = useState("");

  // ── MetaMask 연결 ──────────────────────────────────────────────
  const [account, setAccount]     = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // ── 토큰 잔액 ──────────────────────────────────────────────────
  const [balance, setBalance] = useState<string | null>(null);

  // ── 판매자 지갑 ────────────────────────────────────────────────
  const [sellerWallet, setSellerWallet]   = useState<string | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError]     = useState<string | null>(null);

  // ── 결제 상태 ──────────────────────────────────────────────────
  const [payStep, setPayStep] = useState<PayStep>(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const isMetaMaskInstalled = typeof window !== "undefined" && !!(window as any).ethereum;

  // ── 서버에서 체인/토큰 설정 로드 ─────────────────────────────
  useEffect(() => {
    fetch(`${PAYMENT_SERVER}/api/crypto/chains`)
      .then(r => r.json())
      .then(data => {
        setChains(data.chains);
        if (data.chains.length > 0) {
          setSelectedChain(data.chains[0]);
          setSelectedToken(data.chains[0].tokens[0]);
        }
      })
      .catch(() => setConfigError("결제 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요."))
      .finally(() => setConfigLoading(false));
  }, []);

  // ── sellerId → 판매자 지갑 자동 조회 ─────────────────────────
  useEffect(() => {
    if (!sellerIdParam) return;
    setSellerLoading(true);
    setSellerError(null);
    fetch(`/api/wallet/seller/${sellerIdParam}`)
      .then(r => r.json())
      .then(data => {
        if (data.address) {
          setSellerWallet(data.address);
        } else {
          setSellerError("판매자가 아직 지갑을 등록하지 않았습니다.");
        }
      })
      .catch(() => setSellerError("판매자 지갑 조회에 실패했습니다."))
      .finally(() => setSellerLoading(false));
  }, [sellerIdParam]);

  // ── 토큰 잔액 조회 ────────────────────────────────────────────
  useEffect(() => {
    if (!account || !selectedToken || !selectedChain) {
      setBalance(null);
      return;
    }
    fetchBalance();
  }, [account, selectedToken, selectedChain]);

  const fetchBalance = async () => {
    if (!account || !selectedToken || !selectedChain) return;
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      if (!selectedToken.address) {
        // ETH
        const bal = await provider.getBalance(account);
        setBalance(ethers.formatEther(bal));
      } else {
        // ERC-20
        const contract = new ethers.Contract(selectedToken.address, ERC20_ABI, provider);
        const bal = await contract.balanceOf(account);
        setBalance(ethers.formatUnits(bal, selectedToken.decimals));
      }
    } catch {
      setBalance(null);
    }
  };

  // ── MetaMask 연결 ─────────────────────────────────────────────
  const connectWallet = async () => {
    if (!isMetaMaskInstalled) return alert("MetaMask가 설치되어 있지 않습니다.");
    try {
      setIsConnecting(true);
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (e) {
      console.error("지갑 연결 실패:", e);
    } finally {
      setIsConnecting(false);
    }
  };

  // ── 네트워크 전환 ─────────────────────────────────────────────
  const switchToChain = async (chain: ChainInfo) => {
    const chainIdHex = "0x" + chain.chainId.toString(16);
    try {
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId:  chainIdHex,
            chainName: chain.name,
            rpcUrls:  [chain.rpcUrl],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          }],
        });
      } else {
        throw err;
      }
    }
  };

  // ── 결제 실행 ─────────────────────────────────────────────────
  const handlePay = async () => {
    if (!account || !amount || !selectedChain || !selectedToken) return;
    if (!sellerWallet) {
      return setError(sellerIdParam
        ? "판매자가 지갑을 등록하지 않았습니다."
        : "판매자 지갑 주소가 없습니다.");
    }

    try {
      setError(null);
      setTxHash(null);
      setOrderId(null);

      // 1단계: 주문 생성
      setPayStep(1);
      const orderRes = await fetch(`${PAYMENT_SERVER}/api/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          tokenSymbol:  selectedToken.symbol,
          sellerWallet,
          productId:    productIdParam ? Number(productIdParam) : undefined,
          buyerEmail:   email ?? undefined,  // 구매자 이메일 전달
        }),
      });
      if (!orderRes.ok) throw new Error("주문 생성 실패");
      const { orderId: newOrderId } = await orderRes.json();
      setOrderId(newOrderId);

      // 2단계: 네트워크 전환
      setPayStep(2);
      await switchToChain(selectedChain);

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer   = await provider.getSigner();

      if (!selectedToken.address) {
        // ── ETH 결제 ────────────────────────────────────────────
        setPayStep(4);
        const contract = new ethers.Contract(
          selectedChain.paymentReceiver,
          [
            "function pay(string calldata orderId, address payable recipient) external payable",
          ],
          signer
        );
        const valueWei = ethers.parseEther(amount);
        const tx = await contract.pay(newOrderId, sellerWallet, { value: valueWei });
        setTxHash(tx.hash);
        setPayStep(5);
        await tx.wait(1);

      } else {
        // ── ERC-20 결제 ─────────────────────────────────────────
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
        const amountUnits   = ethers.parseUnits(amount, selectedToken.decimals);

        // 3단계: allowance 확인 후 approve
        setPayStep(3);
        const allowance = await tokenContract.allowance(account, selectedChain.paymentReceiver);
        if (allowance < amountUnits) {
          const approveTx = await tokenContract.approve(selectedChain.paymentReceiver, amountUnits);
          await approveTx.wait(1);
        }

        // 4단계: payERC20 호출
        setPayStep(4);
        const receiverContract = new ethers.Contract(
          selectedChain.paymentReceiver,
          [
            "function payERC20(string calldata orderId, address payable recipient, address tokenAddress, uint256 amount) external",
          ],
          signer
        );
        const tx = await receiverContract.payERC20(
          newOrderId,
          sellerWallet,
          selectedToken.address,
          amountUnits
        );
        setTxHash(tx.hash);
        setPayStep(5);
        await tx.wait(1);
      }

      // 6단계: 서버 확인 폴링 (최대 30초)
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const statusRes = await fetch(`${PAYMENT_SERVER}/api/order/${newOrderId}`);
        const statusData = await statusRes.json();
        if (statusData.status === "paid") {
          setPayStep(6);
          await fetchBalance();
          // 3초 후 주문내역으로 이동
          setTimeout(() => router.push("/orders"), 3000);
          return;
        }
      }
      // 타임아웃이어도 TX가 있으면 완료로 처리
      setPayStep(6);
      await fetchBalance();
      setTimeout(() => router.push("/orders"), 3000);

    } catch (e: any) {
      console.error("결제 오류:", e);
      setError(e.message ?? "결제 중 오류가 발생했습니다.");
      setPayStep(0);
    }
  };

  const reset = () => {
    setPayStep(0);
    setOrderId(null);
    setTxHash(null);
    setError(null);
    setAmount("");
  };

  // ── 렌더링 ────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      <PageHeader
        icon="⛓️"
        title="Multi-Coin Payment"
        subtitle="체인과 토큰을 선택해 결제하세요"
        navLinks={[{ href: "/", label: "메인 페이지" }]}
      />

      <div className={styles.container}>

        {/* ── 설정 로딩 / 에러 ─────────────────────────────── */}
        {configLoading && (
          <div className={styles.card} style={{ textAlign: "center", color: "#94a3b8" }}>
            ⏳ 결제 서버에서 체인 정보 로드 중...
          </div>
        )}

        {configError && (
          <div className={styles.card} style={{ color: "#ef4444", textAlign: "center" }}>
            ⚠️ {configError}
          </div>
        )}

        {!configLoading && !configError && (
          <div className={styles.card}>

            {/* ── MetaMask 연결 ─────────────────────────────── */}
            {!account ? (
              <button
                className={styles.connectBtn}
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? "연결 중..." : "🦊 MetaMask 연결"}
              </button>
            ) : (
              <div className={styles.accountBadge}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>연결된 지갑</span>
                <span className={styles.networkBadge}>
                  🟢 {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            )}

            <hr className={styles.divider} />

            {/* ── 판매자 지갑 상태 ─────────────────────────── */}
            {sellerIdParam && (
              <div className={styles.sellerBox} data-state={sellerError ? "error" : sellerWallet ? "ok" : "loading"}>
                <div className={styles.sellerLabel}>판매자 수신 지갑</div>
                {sellerLoading ? (
                  <div>⏳ 조회 중...</div>
                ) : sellerError ? (
                  <div style={{ color: "#ef4444" }}>⚠️ {sellerError}</div>
                ) : sellerWallet ? (
                  <div style={{ color: "#10b981", wordBreak: "break-all", fontSize: "13px" }}>
                    ✅ {sellerWallet}
                  </div>
                ) : null}
              </div>
            )}

            {/* ── 체인 선택 ─────────────────────────────────── */}
            <div className={styles.sectionLabel}>① 체인 선택</div>
            <div className={styles.chainGrid}>
              {chains.map(chain => (
                <button
                  key={chain.chainId}
                  className={`${styles.chainBtn} ${selectedChain?.chainId === chain.chainId ? styles.chainBtnActive : ""}`}
                  onClick={() => {
                    setSelectedChain(chain);
                    setSelectedToken(chain.tokens[0]);
                    setBalance(null);
                    setPayStep(0);
                    setError(null);
                  }}
                >
                  <span className={styles.chainName}>{chain.name}</span>
                  <span className={styles.chainId}>ID {chain.chainId}</span>
                </button>
              ))}
            </div>

            {/* ── 토큰 선택 ─────────────────────────────────── */}
            {selectedChain && (
              <>
                <div className={styles.sectionLabel}>② 토큰 선택</div>
                <div className={styles.tokenGrid}>
                  {selectedChain.tokens.map(token => (
                    <button
                      key={token.symbol}
                      className={`${styles.tokenBtn} ${selectedToken?.symbol === token.symbol ? styles.tokenBtnActive : ""}`}
                      onClick={() => {
                        setSelectedToken(token);
                        setBalance(null);
                        setPayStep(0);
                        setError(null);
                      }}
                    >
                      <span className={styles.tokenIcon}>
                        {token.symbol === "ETH" ? "⟠" : token.symbol === "USDC" ? "💵" : "🔶"}
                      </span>
                      <span className={styles.tokenSymbol}>{token.symbol}</span>
                      <span className={styles.tokenType}>
                        {token.address ? "ERC-20" : "Native"}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* ── 잔액 ──────────────────────────────────────── */}
            {account && selectedToken && (
              <div className={styles.balanceRow}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>잔액</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>
                  {balance !== null
                    ? `${Number(balance).toFixed(4)} ${selectedToken.symbol}`
                    : <button onClick={fetchBalance} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "13px" }}>조회하기</button>
                  }
                </span>
              </div>
            )}

            <hr className={styles.divider} />

            {/* ── 금액 입력 ─────────────────────────────────── */}
            <div className={styles.sectionLabel}>③ 금액 입력</div>
            <div className={styles.amountRow}>
              <input
                type="number"
                min="0"
                step="any"
                placeholder={`0.00`}
                className={styles.amountInput}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={payStep > 0 && payStep < 6}
              />
              <span className={styles.amountUnit}>{selectedToken?.symbol ?? "—"}</span>
            </div>

            {/* ── 결제 버튼 ─────────────────────────────────── */}
            {payStep === 0 || payStep === 6 ? (
              payStep === 6 ? (
                <div style={{ textAlign: "center" }}>
                  <div className={styles.successMsg}>🎉 결제 완료!</div>
                  {txHash && (
                    <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", wordBreak: "break-all" }}>
                      TxHash: {txHash}
                    </div>
                  )}
                  {orderId && (
                    <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                      주문번호: {orderId}
                    </div>
                  )}
                  <button className={styles.resetBtn} onClick={reset}>다시 결제하기</button>
                </div>
              ) : (
                <button
                  className={styles.payBtn}
                  disabled={!account || !amount || !selectedChain || !selectedToken || (sellerIdParam ? !sellerWallet : false)}
                  onClick={handlePay}
                >
                  {selectedToken?.address
                    ? `💳 ${selectedToken.symbol} 결제 (approve → 전송)`
                    : `💳 ETH 결제`}
                </button>
              )
            ) : (
              <div className={styles.stepBox}>
                <div className={styles.spinner} />
                <div className={styles.stepLabel}>{STEP_LABELS[payStep]}</div>
                {txHash && (
                  <div style={{ fontSize: "11px", color: "#64748b", marginTop: "6px", wordBreak: "break-all" }}>
                    TxHash: {txHash}
                  </div>
                )}
              </div>
            )}

            {/* ── 에러 ──────────────────────────────────────── */}
            {error && (
              <div className={styles.errorMsg}>⚠️ {error}</div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
