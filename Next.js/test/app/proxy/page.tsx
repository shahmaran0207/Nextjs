"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Wallet, Settings2, Box, ArrowRightLeft, RefreshCw, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/component/PageHeader";
import styles from "./Proxy.module.css";

export default function ProxyPage() {
  const [account, setAccount] = useState("");
  const [proxyData, setProxyData] = useState<any>(null);
  
  // 컨트랙트 인스턴스 (주소는 Proxy, ABI는 Logic의 것을 섞어서 씀!)
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  // 업그레이드 전용 인스턴스 (주소는 Proxy, ABI는 Proxy의 것)
  const [proxyAdminContract, setProxyAdminContract] = useState<ethers.Contract | null>(null);

  // 화면 상태
  const [currentVersion, setCurrentVersion] = useState("확인 중...");
  const [currentValue, setCurrentValue] = useState("0");
  const [currentImplAddress, setCurrentImplAddress] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [multiplyValue, setMultiplyValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 1. 지갑 연결 및 데이터 로딩
  const connectWallet = async () => {
    if (!(window as any).ethereum) { alert("MetaMask 설치 필요"); return; }
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setAccount(accounts[0]);

      // API에서 배포된 Proxy 및 Logic 정보 가져오기
      const res = await fetch("/api/proxy");
      const data = await res.json();
      setProxyData(data);

      // ★ 핵심: Ethers.js에게 "Proxy 주소"에 "Logic V2 ABI"가 있다고 거짓말을 합니다.
      // 이렇게 하면 Ethers.js는 Proxy에게 V2의 함수(예: multiply)를 호출하고,
      // Proxy는 fallback을 통해 실제 Logic에게 위임(delegatecall)하게 됩니다.
      const mixedContract = new ethers.Contract(data.proxyAddress, data.logicV2Abi, signer);
      setContract(mixedContract);

      // 업그레이드를 위한 프록시 본연의 관리자용 컨트랙트
      const adminContract = new ethers.Contract(data.proxyAddress, data.proxyAbi, signer);
      setProxyAdminContract(adminContract);

      await fetchState(mixedContract, adminContract);
    } catch (err) {
      console.error(err);
    }
  };

  // 2. 현재 상태 조회
  const fetchState = async (logicC: ethers.Contract, adminC: ethers.Contract) => {
    try {
      // 프록시를 통해 로직 실행
      const v = await logicC.getVersion();
      setCurrentVersion(v);
      const val = await logicC.value();
      setCurrentValue(val.toString());

      // 프록시 자체 변수(implementation 주소) 조회
      const impl = await adminC.implementation();
      setCurrentImplAddress(impl);
    } catch (err) {
      console.error("조회 실패 (아마 V2 함수를 V1에서 호출했을 수 있음)", err);
    }
  };

  const handleRefresh = () => {
    if (contract && proxyAdminContract) fetchState(contract, proxyAdminContract);
  };

  // 3. V1, V2 공통 기능: 숫자 저장
  const handleSetValue = async () => {
    if (!contract || !inputValue) return;
    setIsLoading(true);
    try {
      const tx = await contract.setValue(inputValue);
      await tx.wait();
      alert(`[${currentVersion}] 숫자 ${inputValue} 저장 완료!`);
      handleRefresh();
    } catch (err: any) {
      alert("에러: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. V2 전용 기능: 곱하기
  const handleMultiply = async () => {
    if (!contract || !multiplyValue) return;
    setIsLoading(true);
    try {
      // 만약 현재 머리가 V1이라면, multiply 함수가 없으므로 프록시가 에러를 뱉습니다.
      const tx = await contract.multiply(multiplyValue);
      await tx.wait();
      alert(`[V2 마법 발동] 현재 값에 ${multiplyValue}배 곱하기 성공!`);
      handleRefresh();
    } catch (err: any) {
      // V1일 때 발생하는 에러를 캐치해서 사용자에게 친절하게 알려줍니다.
      if (err.message.includes("could not coalesce error") || err.message.includes("revert")) {
        alert("❌ 실패! 현재 두뇌는 V1이라서 'multiply' 기능을 모릅니다. 먼저 V2로 업그레이드하세요!");
      } else {
        alert("에러: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 5. 프록시 업그레이드! (머리 교체)
  const handleUpgrade = async () => {
    if (!proxyAdminContract || !proxyData) return;
    setIsLoading(true);
    try {
      // 프록시의 주소를 V1에서 V2로 변경합니다.
      const tx = await proxyAdminContract.upgradeTo(proxyData.logicV2Address);
      await tx.wait();
      alert("🎉 축하합니다! 프록시가 Logic V2로 성공적으로 업그레이드되었습니다!\n이제 V2 전용 함수를 쓸 수 있습니다.");
      handleRefresh();
    } catch (err: any) {
      alert("업그레이드 실패: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // UI 헬퍼
  const isV1 = currentVersion === "V1";
  const isV2 = currentVersion === "V2";

  return (
    <div className={styles.pageWrapper}>
      <PageHeader
        icon="🔄"
        title="업그레이더블 컨트랙트 (Proxy)"
        subtitle="블록체인의 불변성을 뚫고 코드를 패치하는 마법 (Delegatecall)"
        navLinks={[
          { href: "/", label: "메인으로" },
        ]}
      />

      <main className={styles.mainContent}>
        {!account ? (
          <div className={styles.centerBox}>
            <h2>프록시 실습을 위해 지갑을 연결하세요</h2>
            <button className={styles.connectBtn} onClick={connectWallet}>
              <Wallet size={20} /> MetaMask 연결
            </button>
          </div>
        ) : (
          <div className={styles.dashboard}>
            
            {/* 좌측: 프록시 구조 시각화 */}
            <div className={styles.architecturePanel}>
              <h3>🏛️ 현재 스마트 컨트랙트 구조</h3>
              
              <div className={styles.proxyBox}>
                <div className={styles.boxHeader}>
                  <Box size={18} />
                  <span>프록시 (몸통/데이터 저장소)</span>
                </div>
                <div className={styles.address}>주소: {proxyData?.proxyAddress}</div>
                <div className={styles.proxyStorage}>
                  <p><strong>저장된 숫자 (value):</strong> <span className={styles.highlight}>{currentValue}</span></p>
                  <p className={styles.note}>※ 두뇌를 바꿔도 이 숫자는 절대 날아가지 않습니다!</p>
                </div>
              </div>

              <div className={styles.arrowDown}>⬇️ delegatecall (코드 빌려오기)</div>

              <div className={`${styles.logicBox} ${isV2 ? styles.v2Active : styles.v1Active}`}>
                <div className={styles.boxHeader}>
                  <Settings2 size={18} />
                  <span>현재 두뇌 (Logic {currentVersion})</span>
                </div>
                <div className={styles.address}>주소: {currentImplAddress}</div>
                <div className={styles.features}>
                  <span className={styles.badge}>✔️ setValue()</span>
                  <span className={styles.badge}>✔️ getVersion()</span>
                  {isV2 && <span className={styles.badgeNew}>✨ multiply()</span>}
                </div>
              </div>

              {isV1 && (
                <button 
                  className={styles.upgradeBtn} 
                  onClick={handleUpgrade}
                  disabled={isLoading}
                >
                  <ArrowRightLeft size={18} /> 
                  {isLoading ? "업그레이드 중..." : "Logic V2로 머리 갈아끼우기 (Upgrade!)"}
                </button>
              )}
              {isV2 && (
                <div className={styles.successMsg}>
                  ✅ 최신 버전(V2)으로 구동 중입니다.
                </div>
              )}
            </div>

            {/* 우측: 기능 테스트 패널 */}
            <div className={styles.controlPanel}>
              <div className={styles.panelHeader}>
                <h3>🎮 기능 테스트</h3>
                <button className={styles.refreshBtn} onClick={handleRefresh}><RefreshCw size={16}/></button>
              </div>

              {/* 공통 기능 */}
              <div className={styles.actionCard}>
                <h4>1. 숫자 덮어쓰기 <span className={styles.versionTag}>V1 / V2 공통</span></h4>
                <p>프록시 몸통에 영구적으로 숫자를 기록합니다.</p>
                <div className={styles.inputRow}>
                  <input 
                    type="number" 
                    value={inputValue} 
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="숫자 입력..."
                  />
                  <button onClick={handleSetValue} disabled={isLoading}>저장</button>
                </div>
              </div>

              {/* V2 전용 기능 */}
              <div className={`${styles.actionCard} ${isV1 ? styles.disabledCard : ""}`}>
                <h4>
                  2. 현재 숫자에 곱하기 
                  <span className={`${styles.versionTag} ${styles.v2Tag}`}>V2 전용 기능</span>
                </h4>
                <p>
                  {isV1 ? (
                    <span className={styles.warningText}><AlertTriangle size={14}/> 현재 V1 상태라 작동하지 않습니다. 억지로 실행해보세요!</span>
                  ) : (
                    "V2로 업그레이드되어 이제 곱하기 기능이 작동합니다!"
                  )}
                </p>
                <div className={styles.inputRow}>
                  <input 
                    type="number" 
                    value={multiplyValue} 
                    onChange={e => setMultiplyValue(e.target.value)}
                    placeholder="몇 배로 곱할까요?"
                  />
                  <button onClick={handleMultiply} disabled={isLoading} className={styles.specialBtn}>곱하기 실행</button>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
