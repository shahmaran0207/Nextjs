"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Wallet, CheckCircle2, RefreshCw, Send, Plus, Gift } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./ERC1155.module.css";

// 우리가 스마트 컨트랙트에 정의한 아이템 ID 상수들
const ITEMS = [
  { id: 0, name: "골드 코인", icon: "💰", type: "재화 (ERC-20 대체 가능)" },
  { id: 1, name: "전설의 검", icon: "🗡️", type: "장비 (ERC-721 대체 불가능)" },
  { id: 2, name: "전설의 방패", icon: "🛡️", type: "장비 (ERC-721 대체 불가능)" },
  { id: 3, name: "체력 포션", icon: "🧪", type: "소모품 (대체 가능)" },
];

export default function ERC1155Page() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [balances, setBalances] = useState<{ [key: number]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [ownerAddress, setOwnerAddress] = useState(""); // 컨트랙트 배포자(owner) 계정인지 확인용

  // 전송 폼 상태
  const [toAddress, setToAddress] = useState("");
  const [sendAmounts, setSendAmounts] = useState<{ [key: number]: number }>({ 0: 0, 1: 0, 2: 0, 3: 0 });

  // 지갑 연결
  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask를 설치해주세요!"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);

      // API에서 배포된 주소와 ABI 가져오기
      const res = await fetch("/api/erc1155");
      if (!res.ok) throw new Error("배포 정보 없음");
      const { address, abi } = await res.json();

      const gameItemsContract = new ethers.Contract(address, abi, signer);
      setContract(gameItemsContract);
      
      // 배포자(owner) 주소 확인
      const owner = await gameItemsContract.owner();
      setOwnerAddress(owner.toLowerCase());

      await fetchBalances(gameItemsContract, accounts[0]);
    } catch (err) {
      console.error(err);
      alert("지갑 연결 실패");
    }
  };

  // 잔액 조회 (배치 조회 사용)
  const fetchBalances = useCallback(async (c: ethers.Contract, acc: string) => {
    if (!c || !acc) return;
    setIsLoading(true);
    try {
      // ERC-1155의 강력한 기능: 여러 아이템의 잔액을 한 번에 조회 (balanceOfBatch)
      const accountsArray = Array(ITEMS.length).fill(acc);
      const idsArray = ITEMS.map(item => item.id);
      
      const balancesBn = await c.balanceOfBatch(accountsArray, idsArray);
      
      const newBalances: { [key: number]: string } = {};
      balancesBn.forEach((bal: any, idx: number) => {
        newBalances[ITEMS[idx].id] = bal.toString();
      });
      setBalances(newBalances);
    } catch (err) {
      console.error("잔액 조회 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    if (contract && account) fetchBalances(contract, account);
  };

  const handleAmountChange = (id: number, val: string) => {
    setSendAmounts(prev => ({ ...prev, [id]: parseInt(val) || 0 }));
  };

  // ⭐️ 핵심: 배치 전송 (단일 트랜잭션으로 여러 종류 아이템 전송)
  const handleBatchTransfer = async () => {
    if (!contract || !toAddress) return;
    
    // 보낼 수량이 0보다 큰 아이템만 필터링
    const idsToTransfer: number[] = [];
    const amountsToTransfer: number[] = [];
    
    Object.entries(sendAmounts).forEach(([idStr, amount]) => {
      if (amount > 0) {
        idsToTransfer.push(parseInt(idStr));
        amountsToTransfer.push(amount);
      }
    });

    if (idsToTransfer.length === 0) {
      alert("보낼 아이템 수량을 입력해주세요.");
      return;
    }

    setIsLoading(true);
    try {
      // ERC-1155의 핵심 함수: safeBatchTransferFrom
      // 인자: (보내는사람, 받는사람, 아이템ID배열, 수량배열, 추가데이터)
      const tx = await contract.safeBatchTransferFrom(
        account,
        toAddress,
        idsToTransfer,
        amountsToTransfer,
        "0x" // data 필드는 비워둠
      );
      
      await tx.wait();
      alert("🎁 아이템이 성공적으로 전송되었습니다! (단 1번의 가스비 사용)");
      setSendAmounts({ 0: 0, 1: 0, 2: 0, 3: 0 }); // 초기화
      await fetchBalances(contract, account); // 내 잔액 업데이트
    } catch (err: any) {
      console.error(err);
      alert(`전송 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isOwner = account && ownerAddress && account.toLowerCase() === ownerAddress;

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🎒"
        title="ERC-1155 게임 아이템"
        subtitle="단일 컨트랙트 + 배치 전송으로 극강의 가스비 효율 달성"
        navLinks={[
          { href: "/", label: "메인 페이지" },
          { href: "/nft-market", label: "ERC-721" },
        ]}
      />

      <main className={styles.mainContent}>

        {/* 지갑 및 상태 영역 */}
        <div className={styles.topBar}>
          <div className={styles.infoBox}>
            <p className={styles.infoLabel}>💡 ERC-1155의 차별점</p>
            <p className={styles.infoText}>
              골드(무한대)와 전설의 검(단 1개)을 <strong>동시에 하나의 트랜잭션</strong>으로 전송할 수 있습니다.
            </p>
          </div>

          <div className={styles.walletGroup}>
            {account ? (
              <>
                <div className={styles.walletBadge}>
                  <CheckCircle2 size={16} />
                  {account.slice(0, 6)}...{account.slice(-4)}
                  {isOwner && <span className={styles.ownerTag}>[관리자]</span>}
                </div>
                <button className={styles.refreshBtn} onClick={handleRefresh}>
                  <RefreshCw size={16} className={isLoading ? styles.spinning : ""} />
                </button>
              </>
            ) : (
              <button className={styles.connectBtn} onClick={connectWallet}>
                <Wallet size={18} /> 지갑 연결
              </button>
            )}
          </div>
        </div>

        <div className={styles.grid}>
          {/* 왼쪽: 내 인벤토리 */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🎒 내 인벤토리</h2>
            
            {!account ? (
              <div className={styles.emptyState}>지갑을 연결하여 내 아이템을 확인하세요.</div>
            ) : (
              <div className={styles.inventoryList}>
                {ITEMS.map(item => (
                  <div key={item.id} className={styles.inventoryItem}>
                    <div className={styles.itemIcon}>{item.icon}</div>
                    <div className={styles.itemDetails}>
                      <h3>{item.name} <span className={styles.itemId}>ID: {item.id}</span></h3>
                      <p>{item.type}</p>
                    </div>
                    <div className={styles.itemCount}>
                      {balances[item.id] || "0"} 개
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽: 배치 전송(선물하기) */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🎁 아이템 일괄 선물하기 (배치 전송)</h2>
            <p className={styles.cardDesc}>
              전송할 수량을 지정하세요. 한 번의 클릭(가스비 1번)으로 여러 종류가 동시에 전송됩니다.
            </p>

            <div className={styles.transferForm}>
              <div className={styles.inputGroup}>
                <label>받는 사람 (지갑 주소)</label>
                <input 
                  type="text" 
                  placeholder="0x..." 
                  value={toAddress}
                  onChange={e => setToAddress(e.target.value)}
                />
              </div>

              <div className={styles.amountGrid}>
                {ITEMS.map(item => (
                  <div key={item.id} className={styles.amountItem}>
                    <label>{item.icon} {item.name}</label>
                    <input 
                      type="number" 
                      min="0"
                      value={sendAmounts[item.id] || 0}
                      onChange={e => handleAmountChange(item.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {/* 디버그/시각화 창 */}
              <div className={styles.txVisualizer}>
                <p>🚀 블록체인 트랜잭션 페이로드 미리보기:</p>
                <code>
                  safeBatchTransferFrom(<br/>
                  &nbsp;&nbsp;from: "나",<br/>
                  &nbsp;&nbsp;to: "{toAddress ? toAddress.slice(0,6)+'...' : '대상 없음'}",<br/>
                  &nbsp;&nbsp;ids: [{Object.entries(sendAmounts).filter(([_,a]) => a>0).map(([id]) => id).join(", ")}],<br/>
                  &nbsp;&nbsp;amounts: [{Object.values(sendAmounts).filter(a => a>0).join(", ")}]<br/>
                  )
                </code>
              </div>

              <button 
                className={styles.sendBtn}
                disabled={!account || isLoading || !toAddress || Object.values(sendAmounts).every(a => a === 0)}
                onClick={handleBatchTransfer}
              >
                {isLoading ? "처리 중..." : <><Send size={18} /> 배치 전송 실행하기</>}
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
