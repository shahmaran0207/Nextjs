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

  // 페이지 진입 시 이미 연결된 MetaMask 계정 자동 감지 (팝업 없이 조용히 조회)
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    (window as any).ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) setAccount(accounts[0]);
      })
      .catch(() => {});

    // 계정 변경 이벤트 구독
    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };
    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  // ── 토큰 잔액 ──────────────────────────────────────────────────
  const [balance, setBalance]               = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError]     = useState<string | null>(null);

  // ── 체인 전환 허용 상태 관리 (세션 스토리지) ──────────────────
  const getChainApprovalKey = (chainId: number) => `chain_approved_${chainId}`;
  const getTokenBalanceKey = (chainId: number, tokenSymbol: string, account: string) => 
    `token_balance_${chainId}_${tokenSymbol}_${account}`;
  const isChainApproved = (chainId: number): boolean => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(getChainApprovalKey(chainId)) === 'true';
  };

  const setChainApproved = (chainId: number) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(getChainApprovalKey(chainId), 'true');
  };

  const getCachedBalance = (chainId: number, tokenSymbol: string, account: string): string | null => {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem(getTokenBalanceKey(chainId, tokenSymbol, account));
    if (!cached) return null;
    
    try {
      const { balance, timestamp } = JSON.parse(cached);
      // 5분 이내의 캐시만 유효
      if (Date.now() - timestamp < 5 * 60 * 1000) {
        return balance;
      }
    } catch {}
    return null;
  };

  const setCachedBalance = (chainId: number, tokenSymbol: string, account: string, balance: string) => {
    if (typeof window === 'undefined') return;
    const cacheData = { balance, timestamp: Date.now() };
    sessionStorage.setItem(getTokenBalanceKey(chainId, tokenSymbol, account), JSON.stringify(cacheData));
  };

  // 캐시 초기화 함수
  const clearAllCache = () => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith('chain_approved_') || key.startsWith('token_balance_')) {
        sessionStorage.removeItem(key);
      }
    });
    setBalance(null);
    alert('캐시가 초기화되었습니다. 다음 조회 시 다시 체인 전환 컨펌이 필요합니다.');
  };

  // ── 판매자 지갑 ────────────────────────────────────────────────
  const [sellerWallet, setSellerWallet]   = useState<string | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerError, setSellerError]     = useState<string | null>(null);

  // ── 가스비 예측 ────────────────────────────────────────────────
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);
  const [gasLoading, setGasLoading]   = useState(false);
  const [gasError, setGasError]       = useState<string | null>(null);

  // ── 트랜잭션 영수증 ────────────────────────────────────────────
  const [txReceipt, setTxReceipt] = useState<{
    blockNumber:  number;
    gasUsed:      string;   // formatEther로 변환된 ETH 단위
    gasUsedUnits: string;   // 실제 gasUsed units
    timestamp:    string;   // 한국시간 형식
    status:       number;   // 1=성공, 0=실패
  } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // ── 결제 상태 ──────────────────────────────────────────────────
  const [payStep, setPayStep] = useState<PayStep>(0);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [txHash, setTxHash]   = useState<string | null>(null);
  const [error, setError]     = useState<string | null>(null);

  const isMetaMaskInstalled = typeof window !== "undefined" && !!(window as any).ethereum;

  // ── 가스비 자동 추정 (amount·chain·token·account 변경 시) ───
  useEffect(() => {
    // 조건 미충족 시 초기화
    if (!account || !amount || parseFloat(amount) <= 0 || !selectedChain || !selectedToken || !sellerWallet) {
      setGasEstimate(null);
      setGasError(null);
      return;
    }

    // 500ms 디바운스 — 타이핑마다 호출 방지
    const timer = setTimeout(() => estimateGasForPayment(), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, selectedChain, selectedToken, account, sellerWallet]);

  const estimateGasForPayment = async () => {
    if (!account || !amount || !selectedChain || !selectedToken || !sellerWallet) return;
    setGasLoading(true);
    setGasError(null);
    setGasEstimate(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer   = await provider.getSigner();

      // ── gasPrice 결정 ─────────────────────────────────────────
      // getFeeData()는 내부에서 eth_maxPriorityFeePerGas + eth_gasPrice를 동시 호출해
      // 로컬 Ganache처럼 EIP-1559 미지원 체인에서 반드시 RPC 에러가 발생함.
      // → 로컬 체인에서는 eth_gasPrice만 직접 조회하고,
      //   공개 네트워크(Sepolia 등)에서도 eth_gasPrice는 항상 지원하므로 이 방법이 더 안전.
      const gasPriceHex = await (window as any).ethereum.request({ method: "eth_gasPrice" });
      const gasPrice    = BigInt(gasPriceHex);

      let totalGas: bigint;

      if (!selectedToken.address) {
        // ── ETH Native: pay() estimateGas ───────────────────
        const contract = new ethers.Contract(
          selectedChain.paymentReceiver,
          ["function pay(string calldata orderId, address payable recipient) external payable"],
          signer
        );
        const valueWei = ethers.parseEther(amount);
        totalGas = await contract.pay.estimateGas("__preview__", sellerWallet, { value: valueWei });

      } else {
        // ── ERC-20: approve() estimateGas + payERC20 고정 overhead ─
        // payERC20.estimateGas는 allowance 없어 revert → 실행 불가
        // approve gas는 금액에 무관하게 거의 동일 (~46,000 gas)
        // payERC20 overhead는 transferFrom(~65,000) + emit(~3,000) ≈ 70,000 gas
        const amountUnits   = ethers.parseUnits(amount, selectedToken.decimals);
        const tokenContract = new ethers.Contract(selectedToken.address, ERC20_ABI, signer);
        const approveGas    = await tokenContract.approve.estimateGas(
          selectedChain.paymentReceiver, amountUnits
        );
        const payERC20Overhead = BigInt(70_000); // transferFrom + event emit 고정 추정값
        totalGas = approveGas + payERC20Overhead;
      }

      const gasCostWei = totalGas * gasPrice;
      const gasCostEth = ethers.formatEther(gasCostWei);
      // 소수점 8자리까지 표시
      setGasEstimate(parseFloat(gasCostEth).toFixed(8));
    } catch (e: any) {
      console.warn("가스비 추정 실패:", e?.message ?? e);
      setGasError("현재 체인/조건에서 가스비를 추정할 수 없습니다.");
    } finally {
      setGasLoading(false);
    }
  };

  // ── 트랜잭션 영수증 조회 (getTransactionReceipt) ────────────────
  const fetchTxReceipt = async (hash: string) => {
    if (!hash) return;
    setReceiptLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // 영수증 조회: 실제 소모된 가스, 블록번호, 성공 여부
      const receipt = await provider.getTransactionReceipt(hash);
      if (!receipt) return;

      // 가스 사용량: receipt.gasUsed(실제 사용한 units) × gasPrice
      // 실제 지불된 수수료(wei) = gasUsed × effectiveGasPrice
      const gasCostWei = receipt.gasUsed * receipt.gasPrice;
      const gasCostEth = ethers.formatEther(gasCostWei);

      // 블록 타임스탬프 조회 (블록 생성 시간)
      const block = await provider.getBlock(receipt.blockNumber);
      const timestamp = block?.timestamp
        ? new Date(block.timestamp * 1000).toLocaleString("ko-KR")
        : "알 수 없음";

      setTxReceipt({
        blockNumber:  receipt.blockNumber,
        gasUsed:      parseFloat(gasCostEth).toFixed(8),
        gasUsedUnits: receipt.gasUsed.toString(),
        timestamp,
        status:       receipt.status ?? 1,
      });
    } catch (e) {
      console.warn("영수증 조회 실패:", e);
    } finally {
      setReceiptLoading(false);
    }
  };

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

  // ── 체인/토큰/지갑 변경 시 캐시된 잔액 확인 ──────────────────
  useEffect(() => {
    if (!account || !selectedToken || !selectedChain) {
      setBalance(null);
      setBalanceError(null);
      return;
    }

    // 캐시된 잔액 확인
    const cachedBalance = getCachedBalance(selectedChain.chainId, selectedToken.symbol, account);
    if (cachedBalance) {
      setBalance(cachedBalance);
      setBalanceError(null);
    } else {
      setBalance(null);
      setBalanceError(null);
    }
  }, [account, selectedToken, selectedChain]);

  const fetchBalance = async () => {
    if (!account || !selectedToken || !selectedChain) return;
    setBalanceLoading(true);
    setBalanceError(null);
    
    try {
      // ── 현재 체인 확인 ────────────────────────────────────────
      const currentChainIdHex = await (window as any).ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(currentChainIdHex, 16);
      
      console.log(`현재 체인: ${currentChainId}, 목표 체인: ${selectedChain.chainId}`);
      
      // ── 체인 전환이 필요한 경우 ──────────────────────────────
      if (currentChainId !== selectedChain.chainId) {
        // 이미 승인된 체인인지 확인
        const alreadyApproved = isChainApproved(selectedChain.chainId);
        
        if (!alreadyApproved) {
          // 첫 번째 체인 전환 시에만 사용자에게 알림
          const shouldProceed = confirm(
            `${selectedChain.name} 체인으로 전환이 필요합니다. 계속하시겠습니까?\n\n` +
            `(이후 이 체인에서는 자동으로 전환됩니다)`
          );
          if (!shouldProceed) {
            setBalanceLoading(false);
            return;
          }
        }
        
        try {
          await switchToChain(selectedChain);
          
          // 체인 전환 후 실제 체인 ID 확인
          const newChainIdHex = await (window as any).ethereum.request({ method: "eth_chainId" });
          const newChainId = parseInt(newChainIdHex, 16);
          
          console.log(`체인 전환 완료: ${currentChainId} → ${newChainId} (목표: ${selectedChain.chainId})`);
          
          // 실제 연결된 체인 ID가 목표와 다르면 에러 던지기 (강력한 제약)
          if (newChainId !== selectedChain.chainId) {
            throw new Error(`연결된 체인 ID(${newChainId})가 목표 체인 ID(${selectedChain.chainId})와 다릅니다. MetaMask 네트워크 설정을 확인해주세요.`);
          }
          
          // 체인 전환 성공 시 승인 상태 저장
          setChainApproved(selectedChain.chainId);
        } catch (switchError: any) {
          console.error(`체인 전환 실패 (${selectedChain.name}):`, switchError);
          
          // Chain A(1337)의 경우 특별 처리 - 직접 RPC로 조회 시도
          if (selectedChain.chainId === 1337) {
            console.log('Chain A 체인 전환 실패, 직접 RPC로 조회 시도');
            try {
              const directProvider = new ethers.JsonRpcProvider(selectedChain.rpcUrl);
              let balanceValue: string;
              
              if (!selectedToken.address) {
                const bal = await directProvider.getBalance(account);
                balanceValue = ethers.formatEther(bal);
              } else {
                const contract = new ethers.Contract(selectedToken.address, ERC20_ABI, directProvider);
                const bal = await contract.balanceOf(account);
                balanceValue = ethers.formatUnits(bal, selectedToken.decimals);
              }
              
              setBalance(balanceValue);
              setCachedBalance(selectedChain.chainId, selectedToken.symbol, account, balanceValue);
              setBalanceError("⚠️ 체인 전환 실패로 직접 RPC 조회됨 (결제 시 수동 체인 전환 필요)");
              return;
            } catch (directError) {
              console.error('직접 RPC 조회도 실패:', directError);
              throw new Error(`Chain A 조회 실패: 체인 전환 및 직접 RPC 모두 실패`);
            }
          } else {
            throw new Error(`체인 전환에 실패했습니다: ${switchError.message}`);
          }
        }
      }

      // 체인 전환 후 provider 재생성 (전환 결과 반영)
      const provider = new ethers.BrowserProvider((window as any).ethereum);

      let balanceValue: string;
      
      if (!selectedToken.address) {
        // ETH Native
        const bal = await provider.getBalance(account);
        balanceValue = ethers.formatEther(bal);
      } else {
        // ERC-20
        const contract = new ethers.Contract(selectedToken.address, ERC20_ABI, provider);
        const bal = await contract.balanceOf(account);
        balanceValue = ethers.formatUnits(bal, selectedToken.decimals);
      }
      
      setBalance(balanceValue);
      
      // 잔액 캐시 저장
      setCachedBalance(selectedChain.chainId, selectedToken.symbol, account, balanceValue);
      
    } catch (e: any) {
      setBalance(null);
      console.error('잔액 조회 에러:', e);
      
      if (e?.code === 4001) {
        // 사용자가 MetaMask 팝업을 직접 거부한 경우
        setBalanceError("MetaMask 체인 전환을 허용해야 잔액을 조회할 수 있습니다.");
      } else if (e?.code === -32002 || e?.message?.includes("already pending")) {
        // MetaMask 팝업이 이미 열려있는 경우
        setBalanceError("MetaMask에 이미 요청이 대기 중입니다. MetaMask 창을 확인하고 처리한 뒤 다시 시도하세요.");
      } else if (e?.code === "BAD_DATA" || e?.message?.includes("could not decode result")) {
        setBalanceError(
          `"${selectedToken?.symbol}" 컨트랙트가 "${selectedChain?.name}" 체인에 존재하지 않습니다. 토큰 주소를 확인하세요.`
        );
      } else if (e?.message?.includes("체인 전환에 실패했습니다")) {
        const isChainA = selectedChain?.chainId === 1337;
        if (isChainA) {
          setBalanceError(
            `Chain A(1337) 전환에 실패했습니다. 다음 방법을 시도해보세요:\n` +
            `1. MetaMask에서 수동으로 네트워크 추가\n` +
            `2. 네트워크 이름: Chain A\n` +
            `3. RPC URL: http://127.0.0.1:8545\n` +
            `4. 체인 ID: 1337\n` +
            `5. 통화 기호: ETH`
          );
        } else {
          setBalanceError(`${selectedChain?.name} 체인 전환에 실패했습니다. MetaMask에서 수동으로 체인을 전환해보세요.`);
        }
      } else if (e?.code === 4902) {
        setBalanceError(`${selectedChain?.name} 체인이 MetaMask에 등록되지 않았습니다. 체인을 추가하는 중 문제가 발생했습니다.`);
      } else {
        setBalanceError(e?.message ?? "잔액 조회에 실패했습니다.");
      }
    } finally {
      setBalanceLoading(false);
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
    const targetChainId = chain.chainId;
    const chainIdHex = "0x" + targetChainId.toString(16);
    
    console.log(`체인 전환 시작: ${chain.name} (${targetChainId}, ${chainIdHex})`);

    try {
      // 먼저 체인 전환 시도
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
      console.log(`체인 전환 성공: ${chain.name}`);
    } catch (switchErr: any) {
      console.log(`체인 전환 시도 실패 (${chain.name}):`, switchErr);
      
      // 체인이 존재하지 않는 경우 (4902 에러)
      if (switchErr?.code === 4902 || switchErr?.message?.includes("Unrecognized chain ID")) {
        console.log(`체인 추가 시도: ${chain.name}`);
        
        try {
          // 체인 추가 시도
          await (window as any).ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: chainIdHex,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              nativeCurrency: { 
                name: "Ethereum", 
                symbol: "ETH", 
                decimals: 18 
              }
            }],
          });
          console.log(`체인 추가 성공: ${chain.name}`);
          
          // 체인 추가 후 다시 전환 시도
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: chainIdHex }],
          });
          console.log(`체인 추가 후 전환 성공: ${chain.name}`);
          
        } catch (addErr: any) {
          console.log(`체인 추가 실패 (${chain.name}):`, addErr);
          
          const msg = addErr?.message ?? "";
          
          // 같은 RPC 엔드포인트를 사용하는 기존 네트워크가 있는 경우
          if (msg.includes("same RPC endpoint") || msg.includes("already exists")) {
            console.log(`RPC 엔드포인트 충돌 감지: ${chain.name}`);
            
            // 에러 메시지에서 기존 체인 ID 추출
            const chainMatch = msg.match(/chain (0x[0-9a-fA-F]+)/i);
            if (chainMatch) {
              const existingChainIdHex = chainMatch[1];
              const existingChainId = parseInt(existingChainIdHex, 16);
              console.log(`기존 체인 ID 발견: ${existingChainIdHex} (${existingChainId})`);

              // 만약 기존에 저장된 체인 ID가 우리가 원하는 체인 ID(3133x)와 다르다면
              if (existingChainId !== targetChainId) {
                throw new Error(`MetaMask에 예전 체인 ID(${existingChainId})로 저장된 네트워크가 있습니다. MetaMask 확장프로그램 > 설정 > 네트워크 메뉴로 가셔서 기존 로컬 네트워크(Chain A/B/C 등)를 모두 삭제한 후 다시 시도해주세요!`);
              }
              
              try {
                await (window as any).ethereum.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: existingChainIdHex }],
                });
                console.log(`기존 체인으로 전환 성공: ${existingChainIdHex}`);
                
                return; // 성공
              } catch (existingErr) {
                console.log(`기존 체인 전환도 실패:`, existingErr);
                throw new Error(`체인 전환에 실패했습니다. MetaMask에서 수동으로 ${chain.name} 체인을 추가해주세요.`);
              }
            } else {
              // 체인 ID를 추출할 수 없는 경우
              throw new Error(`${chain.name} 체인 추가에 실패했습니다. 같은 RPC를 사용하는 다른 체인이 이미 존재합니다.`);
            }
          } else if (addErr?.code === 4001) {
            // 사용자가 체인 추가를 거부한 경우
            throw new Error(`${chain.name} 체인 추가가 취소되었습니다.`);
          } else {
            // 기타 에러
            throw new Error(`${chain.name} 체인 추가에 실패했습니다: ${msg}`);
          }
        }
      } else if (switchErr?.code === 4001) {
        // 사용자가 체인 전환을 거부한 경우
        throw new Error(`${chain.name} 체인 전환이 취소되었습니다.`);
      } else {
        // 기타 체인 전환 에러
        throw new Error(`${chain.name} 체인 전환에 실패했습니다: ${switchErr?.message}`);
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
      setTxReceipt(null); // 이전 영수증 초기화

      let currentTxHash: string | null = null; // 폴링 이후에도 hash 참조용

      // 배송 정보 불러오기
      let shippingInfo = {};
      try {
        const storedShipping = sessionStorage.getItem("crypto_shipping_info");
        if (storedShipping) {
          shippingInfo = JSON.parse(storedShipping);
        }
      } catch (e) {}

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
          ...shippingInfo,
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
        currentTxHash = tx.hash;
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
        currentTxHash = tx.hash;
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
          // txHash state는 set이 비동기라 지역변수 사용
          if (currentTxHash) await fetchTxReceipt(currentTxHash);
          // 3초 후 주문내역으로 이동
          setTimeout(() => router.push("/orders"), 3000);
          return;
        }
      }
      // 타임아웃이어도 TX가 있으면 완료로 처리
      setPayStep(6);
      await fetchBalance();
      if (currentTxHash) await fetchTxReceipt(currentTxHash);
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
    setTxReceipt(null); // 영수증 상태 초기화
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
                <button
                  onClick={clearAllCache}
                  style={{
                    background: "none", border: "1px solid rgba(255,255,255,0.1)", 
                    color: "#94a3b8", fontSize: "10px", padding: "4px 8px", 
                    borderRadius: "4px", cursor: "pointer", marginLeft: "8px"
                  }}
                  title="체인 승인 및 잔액 캐시 초기화"
                >
                  🗑️ 캐시 초기화
                </button>
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
                    // 캐시된 잔액이 있으면 유지, 없으면 null
                    const cachedBalance = getCachedBalance(chain.chainId, chain.tokens[0].symbol, account || '');
                    setBalance(cachedBalance);
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
                        // 캐시된 잔액이 있으면 유지, 없으면 null
                        const cachedBalance = getCachedBalance(selectedChain!.chainId, token.symbol, account || '');
                        setBalance(cachedBalance);
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
            {selectedToken && (
              <div className={styles.balanceRow}>
                <span style={{ color: "#64748b", fontSize: "13px" }}>잔액</span>
                <span style={{ color: "#10b981", fontWeight: 600 }}>
                  {!account ? (
                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>🦊 MetaMask 연결 후 조회 가능</span>
                  ) : balanceLoading ? (
                    <span style={{ color: "#94a3b8", fontSize: "13px" }}>⏳ 조회 중...</span>
                  ) : balance !== null ? (
                    <span>
                      {`${Number(balance).toFixed(4)} ${selectedToken.symbol}`}
                      {getCachedBalance(selectedChain!.chainId, selectedToken.symbol, account) && (
                        <span style={{ color: "#64748b", fontSize: "10px", marginLeft: "4px" }}>(캐시)</span>
                      )}
                      <button
                        onClick={fetchBalance}
                        style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "11px", marginLeft: "6px" }}
                      >↻ 새로고침</button>
                    </span>
                  ) : (
                    <span>
                      <button
                        onClick={fetchBalance}
                        style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: "13px", textDecoration: "underline" }}
                      >조회하기</button>
                    </span>
                  )}
                </span>
              </div>
            )}
            {/* ── 잔액 조회 에러 ────────────────────────────── */}
            {balanceError && (
              <div style={{ fontSize: "12px", color: "#ef4444", marginTop: "4px", padding: "6px 0" }}>
                ⚠️ {balanceError}
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

            {/* ── ⛽ 가스비 예측 ─────────────────────────────────── */}
            {account && sellerWallet && amount && parseFloat(amount) > 0 && (
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#94a3b8",
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.15)",
                borderRadius: "8px",
                padding: "8px 12px",
                marginTop: "8px",
              }}>
                <span>⛽ 예상 가스비</span>
                <span style={{ fontWeight: 600, color: "#a5b4fc" }}>
                  {gasLoading ? (
                    "계산 중..."
                  ) : gasEstimate !== null ? (
                    `≈ ${gasEstimate} ETH`
                  ) : gasError ? (
                    <span style={{ color: "#f59e0b", fontSize: "11px" }}>추정 불가</span>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
            )}

            {/* ── 잔액 관련 경고 ───────────────────────────────────── */}
            {(() => {
              const notFetched  = account !== null && balance === null && !balanceLoading;
              const isOverBalance =
                balance !== null &&
                amount !== "" &&
                parseFloat(amount) > parseFloat(balance);

              if (notFetched) {
                return (
                  <div style={{
                    fontSize: "13px",
                    color: "#f59e0b",
                    background: "rgba(245,158,11,0.08)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "8px",
                  }}>
                    🔍 결제 전에 <strong>잔액 조회</strong>를 먼저 해주세요.
                  </div>
                );
              }
              if (isOverBalance) {
                return (
                  <div style={{
                    fontSize: "13px",
                    color: "#ef4444",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.3)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    marginBottom: "8px",
                  }}>
                    ⚠️ 입력한 금액({parseFloat(amount).toFixed(4)} {selectedToken?.symbol})이
                    잔액({parseFloat(balance!).toFixed(4)} {selectedToken?.symbol})을 초과합니다.
                  </div>
                );
              }
              return null;
            })()}
            {/* ── 결제 버튼 ─────────────────────────────────── */}
            {payStep === 0 || payStep === 6 ? (
              payStep === 6 ? (
                <div style={{ textAlign: "center" }}>
                  <div className={styles.successMsg}>🎉 결제 완료!</div>

                  {/* ── 트랜잭션 영수증 패널 ───────────────────────── */}
                  <div style={{
                    background: "rgba(16,185,129,0.06)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    marginTop: "12px",
                    textAlign: "left",
                    fontSize: "13px",
                  }}>
                    <div style={{ color: "#10b981", fontWeight: 700, marginBottom: "10px", fontSize: "14px" }}>
                      🧾 트랜잭션 영수증
                    </div>

                    {/* TxHash */}
                    {txHash && (
                      <div style={{ marginBottom: "6px" }}>
                        <span style={{ color: "#64748b" }}>TxHash</span>
                        <div style={{ color: "#e2e8f0", wordBreak: "break-all", fontSize: "11px", marginTop: "2px" }}>
                          {txHash}
                        </div>
                      </div>
                    )}

                    {/* 주문번호 */}
                    {orderId && (
                      <div style={{ marginBottom: "6px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>주문번호</span>
                        <span style={{ color: "#94a3b8" }}>{orderId}</span>
                      </div>
                    )}

                    <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.07)", margin: "8px 0" }} />

                    {/* 영수증 상세 */}
                    {receiptLoading ? (
                      <div style={{ color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>
                        ⏳ 영수증 조회 중...
                      </div>
                    ) : txReceipt ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ color: "#64748b" }}>🔒 블록 번호</span>
                          <span style={{ color: "#a5b4fc", fontWeight: 600 }}>#{txReceipt.blockNumber.toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ color: "#64748b" }}>⛽ 실제 가스비</span>
                          <span style={{ color: "#f59e0b", fontWeight: 600 }}>≈ {txReceipt.gasUsed} ETH</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ color: "#64748b" }}>사용 가스 유닛</span>
                          <span style={{ color: "#94a3b8" }}>{Number(txReceipt.gasUsedUnits).toLocaleString()} units</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ color: "#64748b" }}>📅 블록 시간</span>
                          <span style={{ color: "#94a3b8" }}>{txReceipt.timestamp}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b" }}>상태</span>
                          <span style={{ color: txReceipt.status === 1 ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                            {txReceipt.status === 1 ? "✅ Success" : "❌ Reverted"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: "#64748b", textAlign: "center", fontSize: "12px" }}>
                        영수증 정보를 불러올 수 없습니다.
                      </div>
                    )}
                  </div>

                  <button className={styles.resetBtn} onClick={reset}>다시 결제하기</button>
                </div>
              ) : (
                <button
                  className={styles.payBtn}
                  disabled={
                    !account ||
                    !amount ||
                    !selectedChain ||
                    !selectedToken ||
                    (sellerIdParam ? !sellerWallet : false) ||
                    // 잔액 미조회 시 결제 차단 (account 연결됐으나 balance가 없는 경우)
                    (account !== null && balance === null && !balanceLoading) ||
                    // 잔액 초과 시 결제 차단
                    (balance !== null && parseFloat(amount) > parseFloat(balance))
                  }
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
