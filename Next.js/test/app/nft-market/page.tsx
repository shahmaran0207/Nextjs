"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import styles from "./nft-market.module.css";

// NFT 아이템 타입
interface NFTItem {
  tokenId: number;
  name: string;
  owner: string;
  price?: string; // 판매 중인 경우 가격
}

// NFT 카드에 색상 다양성을 주기 위한 이모지 목록
const EMOJIS = ["🎨", "🏆", "🌟", "💎", "🚀", "🦄", "🔮", "🎭", "🌈", "⚡"];

export default function NFTMarketPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [marketContract, setMarketContract] = useState<ethers.Contract | null>(null);
  const [nftName, setNftName] = useState("");
  const [myNFTs, setMyNFTs] = useState<NFTItem[]>([]);
  const [marketNFTs, setMarketNFTs] = useState<NFTItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // ── Phase 2: 마켓 관련 State ──────────────────────────────────────────────
  const [marketInfo, setMarketInfo] = useState<any>(null);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [marketOwner, setMarketOwner] = useState<string | null>(null);
  const [accumulatedFee, setAccumulatedFee] = useState("0");

  // ── 초기화: 컨트랙트 연결 ─────────────────────────────────────────────
  useEffect(() => {
    initContract();
  }, []);

  const initContract = async () => {
    try {
      // API에서 배포된 컨트랙트 정보 가져오기
      const res = await fetch("/api/nft-market/info");
      const marketRes = await fetch("/api/nft-market/marketplace-info");

      if (!res.ok) {
        showToast("NFT 컨트랙트가 아직 배포되지 않았습니다.", "error");
        return;
      }
      const info = await res.json();

      let mInfo = null;
      if (marketRes.ok) {
        mInfo = await marketRes.json();
        setMarketInfo(mInfo);
      }

      // 읽기 전용 Provider (Ganache Chain A)
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const readContract = new ethers.Contract(info.MyNFT.address, info.MyNFT.abi, provider);
      setContract(readContract);

      if (mInfo && mInfo.Marketplace) {
        const readMarketContract = new ethers.Contract(mInfo.Marketplace.address, mInfo.Marketplace.abi, provider);
        setMarketContract(readMarketContract);
        const ownerAddress = await readMarketContract.owner();
        setMarketOwner(ownerAddress.toLowerCase());
      }

      // MetaMask 연결 여부 확인
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const _provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await _provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
        }
      }
    } catch (err) {
      console.error("초기화 오류:", err);
      showToast("초기화 중 오류가 발생했습니다.", "error");
    }
  };

  // ── 데이터 로드 ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!contract) return;
    try {
      // 총 발행량 조회
      const totalMinted = Number(await contract.totalMinted());
      setTotal(totalMinted);

      if (!account || totalMinted === 0) {
        setMyNFTs([]);
        return;
      }

      // ── 1. 내 NFT 불러오기 (기존 방식 유지) ──
      const myList: NFTItem[] = [];
      for (let id = 0; id < totalMinted; id++) {
        const owner = await contract.ownerOf(id);
        if (owner.toLowerCase() === account.toLowerCase()) {
          const name = await contract.getTokenName(id);
          let price;
          if (marketContract) {
            const listing = await marketContract.listings(id);
            if (listing.active) price = ethers.formatEther(listing.price);
          }
          myList.push({ tokenId: id, name, owner, price });
        }
      }
      setMyNFTs(myList);

      // ── 2. 🚀 Phase 5: 이벤트(Logs)를 이용한 초고속 마켓 상태 조립 ──
      const mList: NFTItem[] = [];
      if (marketContract) {
        // 블록체인에서 3가지 종류의 영수증(이벤트)을 전부 긁어옵니다.
        const listedEvents = await marketContract.queryFilter("ItemListed");
        const canceledEvents = await marketContract.queryFilter("ItemCanceled");
        const soldEvents = await marketContract.queryFilter("ItemSold");

        // 모든 영수증을 시간순(블록 번호 및 로그 순서)으로 정렬
        const allEvents = [...listedEvents, ...canceledEvents, ...soldEvents].sort((a: any, b: any) => {
          if (a.blockNumber === b.blockNumber) return a.logIndex - b.logIndex;
          return a.blockNumber - b.blockNumber;
        });

        // 현재 마켓에 살아있는 토큰만 담을 임시 바구니 (tokenId -> price)
        const activeListings = new Map<number, string>();

        // 시간순으로 영수증을 하나씩 읽어 내려가며 퍼즐을 맞춥니다.
        for (const ev of allEvents as any[]) {
          const eventName = ev.eventName || ev.fragment?.name;
          const tokenId = Number(ev.args[0]);

          if (eventName === "ItemListed") {
            const price = ethers.formatEther(ev.args[2]);
            activeListings.set(tokenId, price); // 장터에 올림!
          } else if (eventName === "ItemCanceled" || eventName === "ItemSold") {
            activeListings.delete(tokenId); // 장터에서 내려감! (취소 또는 팔림)
          }
        }

        // 👁️ [검증용 코드] 브라우저 콘솔창에서 확인할 수 있도록 출력합니다.
        console.log("📜 [Phase 5 최적화 검증] 블록체인에서 긁어온 영수증 개수:", allEvents.length, "개");
        console.log("🔍 [Phase 5 최적화 검증] 가져온 영수증 원본 데이터:", allEvents);
        console.log("🛒 [Phase 5 최적화 검증] 최종 조립된 현재 장터 매물:", activeListings);

        // 바구니에 최종적으로 남은 토큰들(진짜 팔고 있는 물건)만 화면에 그릴 준비를 합니다.
        // 이로써 10,000번 반복할 필요 없이 딱 필요한 토큰 정보만 가져옵니다!
        for (const [tokenId, price] of Array.from(activeListings.entries())) {
          const owner = await contract.ownerOf(tokenId);
          
          // 내 물건은 '내 컬렉션'에 나오니까 장터 화면에서는 빼줍니다.
          if (owner.toLowerCase() !== account.toLowerCase()) {
            const name = await contract.getTokenName(tokenId);
            mList.push({ tokenId, name, owner, price });
          }
        }
      }
      setMarketNFTs(mList);

      // ── Phase 4: 누적 수수료 잔액 조회 ──
      if (marketContract) {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const address = await marketContract.getAddress();
        const balanceWei = await provider.getBalance(address);
        setAccumulatedFee(ethers.formatEther(balanceWei));
      }

    } catch (err) {
      console.error("데이터 로드 오류:", err);
    }
  }, [contract, account, marketContract]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── 지갑 연결 ──────────────────────────────────────────────────────────
  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      showToast("MetaMask를 설치해주세요.", "error");
      return;
    }
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } catch {
      showToast("지갑 연결을 취소했습니다.", "error");
    }
  };

  // ── NFT 민팅 ────────────────────────────────────────────────────────────
  const handleMint = async () => {
    if (!account) return showToast("지갑을 먼저 연결해주세요.", "error");
    if (!nftName.trim()) return showToast("NFT 이름을 입력해주세요.", "error");
    if (!contract) return;

    setLoading(true);
    try {
      // 쓰기용 컨트랙트 (MetaMask Signer 연결)
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // ── 학습 포인트: 컨트랙트 정보 가져오기 ──
      const res = await fetch("/api/nft-market/info");
      const info = await res.json();

      // Signer로 컨트랙트 연결 → 트랜잭션 서명 가능
      const writeContract = new ethers.Contract(
        info.MyNFT.address,
        info.MyNFT.abi,
        signer
      );

      // mint() 호출 (mintPrice == 0 이므로 value 없이)
      const tx = await writeContract.mint(nftName.trim());
      showToast("트랜잭션 전송 중... 잠시 기다려주세요.", "success");

      // 블록에 포함될 때까지 대기
      const receipt = await tx.wait(1);
      showToast(`🎉 "${nftName}" NFT 민팅 완료!`, "success");
      setNftName("");

      // 목록 새로고침
      await loadData();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        showToast("서명을 취소했습니다.", "error");
      } else {
        showToast(err.reason ?? err.message ?? "민팅 실패", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── NFT 마켓 리스팅 (Approve + List) ────────────────────────────────────
  const handleSell = async () => {
    if (selectedTokenId === null) return;
    if (!sellPrice || Number(sellPrice) <= 0) return showToast("가격을 올바르게 입력해주세요.", "error");
    if (!account || !contract || !marketInfo) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // 1. MyNFT 컨트랙트 (Approve 용도)
      const myNftWrite = contract.connect(signer) as ethers.Contract;

      // 2. Marketplace 컨트랙트 (List 용도)
      const marketWrite = new ethers.Contract(
        marketInfo.Marketplace.address,
        marketInfo.Marketplace.abi,
        signer
      );

      const priceInWei = ethers.parseEther(sellPrice);

      // Step 1: Approve (권한 위임)
      showToast("1/2: 마켓플레이스에 권한을 위임합니다 (Approve)...", "success");
      const approveTx = await myNftWrite.approve(marketInfo.Marketplace.address, selectedTokenId);
      await approveTx.wait();

      // Step 2: List (판매 등록)
      showToast("2/2: 진열대에 NFT를 등록합니다 (List)...", "success");
      const listTx = await marketWrite.listNFT(selectedTokenId, priceInWei);
      await listTx.wait();

      showToast("🎉 판매 등록 완료!", "success");
      setSellModalOpen(false);
      setSellPrice("");
      await loadData(); // 목록 새로고침
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        showToast("서명을 취소했습니다.", "error");
      } else {
        showToast(err.reason ?? err.message ?? "리스팅 실패", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 3: NFT 구매 (Buy) ──────────────────────────────────────────────
  const handleBuy = async (tokenId: number, priceStr: string) => {
    if (!account || !marketInfo) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const marketWrite = new ethers.Contract(
        marketInfo.Marketplace.address,
        marketInfo.Marketplace.abi,
        signer
      );

      const priceInWei = ethers.parseEther(priceStr);

      showToast("결제 트랜잭션을 전송합니다...", "success");

      // ✨ 마법이 일어나는 곳: value 에 돈을 실어서 보냅니다 (payable)
      const tx = await marketWrite.buyNFT(tokenId, { value: priceInWei });

      showToast("블록에 기록되는 중입니다...", "success");
      await tx.wait();

      showToast("🎉 구매 성공! 내 컬렉션을 확인하세요.", "success");
      await loadData();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        showToast("결제를 취소했습니다.", "error");
      } else {
        showToast(err.reason ?? err.message ?? "구매 실패", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 4: 리스팅 취소 (Cancel) ───────────────────────────────────────
  const handleCancel = async (tokenId: number) => {
    if (!account || !marketInfo) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const marketWrite = new ethers.Contract(
        marketInfo.Marketplace.address,
        marketInfo.Marketplace.abi,
        signer
      );

      showToast("판매 취소 트랜잭션을 전송합니다...", "success");
      const tx = await marketWrite.cancelListing(tokenId);
      
      showToast("블록에 기록되는 중입니다...", "success");
      await tx.wait();

      showToast("판매가 취소되었습니다.", "success");
      await loadData();
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        showToast("취소를 거절했습니다.", "error");
      } else {
        showToast(err.reason ?? err.message ?? "취소 실패", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 4: 관리자 수수료 인출 (Withdraw) ──────────────────────────────
  const handleWithdraw = async () => {
    if (!account || !marketInfo) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const marketWrite = new ethers.Contract(
        marketInfo.Marketplace.address,
        marketInfo.Marketplace.abi,
        signer
      );

      showToast("수수료 인출을 요청합니다...", "success");
      const tx = await marketWrite.withdrawFee();
      
      showToast("블록에 기록되는 중입니다...", "success");
      await tx.wait();

      showToast("🎉 수수료 정산이 완료되었습니다!", "success");
    } catch (err: any) {
      if (err.code === "ACTION_REJECTED") {
        showToast("인출을 취소했습니다.", "error");
      } else {
        showToast(err.reason ?? err.message ?? "인출 실패", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── 토스트 헬퍼 ────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── 렌더 ───────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>🎨 NFT Marketplace</h1>
          <p>Phase 5 — 이벤트 인덱싱 최적화</p>
        </div>
        {account ? (
          <button className={styles.walletBtn}>
            ✅ {account.slice(0, 6)}...{account.slice(-4)}
          </button>
        ) : (
          <button className={styles.walletBtn} onClick={connectWallet}>
            🦊 지갑 연결
          </button>
        )}
      </div>

      {/* 메인 */}
      <div className={styles.content}>

        {/* 좌측: 민팅 패널 */}
        <div className={`${styles.card} ${styles.mintPanel}`}>
          <div className={styles.cardTitle}>✨ NFT 민팅</div>

          {/* 통계 */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{total}</div>
              <div className={styles.statLabel}>총 발행량</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{myNFTs.length}</div>
              <div className={styles.statLabel}>내 NFT</div>
            </div>
          </div>

          {/* 입력 */}
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>NFT 이름</label>
            <input
              className={styles.input}
              placeholder="예: Golden Sword #1"
              value={nftName}
              onChange={e => setNftName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleMint()}
            />
          </div>

          <button
            className={styles.mintBtn}
            onClick={handleMint}
            disabled={loading || !account}
          >
            {loading ? "⏳ 민팅 중..." : "🎨 Mint NFT (무료)"}
          </button>
          <p className={styles.mintNote}>
            현재 민팅 가격: 무료 · 발행 한도: 없음
          </p>
        </div>

        {/* 우측: 내 NFT 목록 및 장터 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className={`${styles.card} ${styles.nftPanel}`}>
            <div className={styles.cardTitle}>
              🖼️ 내 NFT 컬렉션
              {account && (
                <span style={{ fontSize: "11px", color: "#475569", fontWeight: 400, marginLeft: "auto" }}>
                  {account.slice(0, 8)}...
                </span>
              )}
            </div>

            {!account ? (
              <div className={styles.emptyState}>
                지갑을 연결하면 보유한 NFT가 표시됩니다.
              </div>
            ) : myNFTs.length === 0 ? (
              <div className={styles.emptyState}>
                아직 민팅한 NFT가 없습니다.<br />
                왼쪽에서 첫 번째 NFT를 만들어보세요!
              </div>
            ) : (
              <div className={styles.nftGrid}>
                {myNFTs.map(nft => (
                  <div key={nft.tokenId} className={styles.nftCardRelative}>
                    {nft.price && (
                      <div className={styles.listingBadge}>{nft.price} ETH</div>
                    )}
                    <div
                      className={styles.nftImage}
                      style={{ "--hue": `${(nft.tokenId * 47 + 200) % 360}` } as React.CSSProperties}
                    >
                      {EMOJIS[nft.tokenId % EMOJIS.length]}
                    </div>
                    <div className={styles.nftId}>Token #{nft.tokenId}</div>
                    <div className={styles.nftName}>{nft.name}</div>
                    {!nft.price && marketInfo && (
                      <button
                        className={styles.sellBtn}
                        onClick={() => { setSelectedTokenId(nft.tokenId); setSellModalOpen(true); }}
                      >
                        판매하기
                      </button>
                    )}
                    {nft.price && marketInfo && (
                      <button
                        className={styles.sellBtn}
                        style={{ background: "#f1f5f9", color: "#64748b" }}
                        onClick={() => handleCancel(nft.tokenId)}
                        disabled={loading}
                      >
                        판매 취소
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={`${styles.card} ${styles.nftPanel}`}>
            <div className={styles.cardTitle}>
              🛒 열린 장터 (Marketplace)
            </div>
            {marketNFTs.length === 0 ? (
              <div className={styles.emptyState}>
                아직 마켓에 올라온 다른 사람의 NFT가 없습니다.
              </div>
            ) : (
              <div className={styles.nftGrid}>
                {marketNFTs.map(nft => (
                  <div key={nft.tokenId} className={styles.nftCardRelative}>
                    {nft.price && (
                      <div className={styles.listingBadge}>{nft.price} ETH</div>
                    )}
                    <div
                      className={styles.nftImage}
                      style={{ "--hue": `${(nft.tokenId * 47 + 200) % 360}` } as React.CSSProperties}
                    >
                      {EMOJIS[nft.tokenId % EMOJIS.length]}
                    </div>
                    <div className={styles.nftId}>Token #{nft.tokenId}</div>
                    <div className={styles.nftName}>{nft.name}</div>
                    <button
                      className={styles.buyBtn}
                      onClick={() => handleBuy(nft.tokenId, nft.price!)}
                      disabled={loading}
                    >
                      {nft.price} ETH에 구매
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 관리자 전용 영역 */}
      {account && marketOwner && account.toLowerCase() === marketOwner && (
        <div style={{ marginTop: "32px", padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: "600", color: "#334155" }}>👑 관리자 전용 패널</div>
            <div style={{ fontSize: "12px", color: "#64748b" }}>마켓 컨트랙트에 누적된 2.5% 수수료를 한 번에 정산합니다.</div>
            <div style={{ marginTop: "8px", fontSize: "14px", fontWeight: "bold", color: "#ec4899" }}>
              현재 누적 수수료: {accumulatedFee} ETH
            </div>
          </div>
          <button 
            onClick={handleWithdraw} 
            disabled={loading || accumulatedFee === "0.0"}
            style={{ 
              padding: "8px 16px", 
              background: (loading || accumulatedFee === "0.0") ? "#cbd5e1" : "#10b981", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              fontWeight: "600", 
              cursor: (loading || accumulatedFee === "0.0") ? "not-allowed" : "pointer" 
            }}
          >
            💰 수수료 인출하기
          </button>
        </div>
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.msg}
        </div>
      )}

      {/* 리스팅 모달 */}
      {sellModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !loading && setSellModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalTitle}>
              판매 등록하기
              <button className={styles.closeBtn} onClick={() => setSellModalOpen(false)} disabled={loading}>×</button>
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>판매 가격 (ETH)</label>
              <input
                type="number"
                step="0.01"
                className={styles.input}
                placeholder="예: 0.1"
                value={sellPrice}
                onChange={e => setSellPrice(e.target.value)}
                disabled={loading}
              />
            </div>
            <p style={{ fontSize: "11px", color: "#64748b", marginTop: "8px", lineHeight: "1.4" }}>
              안내: 판매 등록 시 메타마스크 서명이 <b>2번</b> 진행됩니다.<br />
              1. 마켓플레이스 전송 권한 위임 (Approve)<br />
              2. 마켓플레이스 판매 등록 (List)<br />
              <b style={{ color: "#ec4899" }}>※ 판매 완료 시 2.5%의 플랫폼 수수료가 차감됩니다.</b>
            </p>
            <div className={styles.modalActions}>
              <button className={styles.cancelBtn} onClick={() => setSellModalOpen(false)} disabled={loading}>취소</button>
              <button className={styles.confirmBtn} onClick={handleSell} disabled={loading || !sellPrice}>
                {loading ? "진행 중..." : "등록 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
