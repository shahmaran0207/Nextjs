/**
 * land-contract.ts
 * ──────────────────────────────────────────────────────────────────
 * 서버(Node.js) 환경에서 LandNFT 컨트랙트를 호출하는 헬퍼 유틸리티.
 *
 * 프론트엔드(브라우저)에서는 MetaMask(BrowserProvider + getSigner())를 사용하지만,
 * 서버 API에서는 파일시스템에서 배포자 개인키와 컨트랙트 주소를 읽어
 * JsonRpcProvider + Wallet으로 직접 서명합니다.
 *
 * [사용 흐름]
 *   POST /api/land-parcels (구역 DB 저장)
 *      └→ registerParcelOnChain(parcelId, name, priceEth)
 *            └→ LandNFT.registerParcel(id, name, priceWei)  ← 온체인 등록
 * ──────────────────────────────────────────────────────────────────
 */

import { ethers } from "ethers";
import path from "path";
import fs from "fs";

// ── 배포 정보 로드 ─────────────────────────────────────────────────
function loadDeployedData() {
  const filePath = path.join(
    process.cwd(),
    "blockchain-study",
    "deployed",
    "land-nft-address.json"
  );
  if (!fs.existsSync(filePath)) {
    throw new Error("LandNFT가 배포되지 않았습니다. deploy-land-nft.js를 먼저 실행하세요.");
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

// ── 관리자(배포자) Signer 생성 ─────────────────────────────────────
// 서버에서는 MetaMask 없이 배포자 개인키로 직접 서명합니다.
// ★ 실제 서비스에서는 .env에서 읽어야 함 (절대 하드코딩 금지)
function getAdminSigner() {
  const data = loadDeployedData();
  const provider = new ethers.JsonRpcProvider(
    process.env.BLOCKCHAIN_RPC_URL ?? "http://127.0.0.1:8545"
  );
  // Ganache 기본 계정 #0 (배포자) — 테스트 전용
  const privateKey =
    process.env.ADMIN_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  return { signer: new ethers.Wallet(privateKey, provider), data };
}

// ── 구역 컨트랙트 등록 ─────────────────────────────────────────────

/**
 * DB에 저장된 구역을 LandNFT 컨트랙트에 등록합니다.
 * 이미 등록된 구역이면 오류 없이 건너뜁니다.
 *
 * @param dbParcelId  land_parcels.id
 * @param name        구역 이름
 * @param priceEth    가격 (ETH 단위 문자열, 예: "0.1")
 * @returns           트랜잭션 해시 (이미 등록된 경우 null)
 */
export async function registerParcelOnChain(
  dbParcelId: number,
  name: string,
  priceEth: string
): Promise<string | null> {
  try {
    const { signer, data } = getAdminSigner();
    const contract = new ethers.Contract(
      data.LandNFT.address,
      data.LandNFT.abi,
      signer
    );

    // 이미 등록됐는지 확인 (중복 방지)
    const parcelInfo = await contract.getParcel(BigInt(dbParcelId));
    if (parcelInfo.registered) {
      console.log(`[LandNFT] 구역 #${dbParcelId} 이미 등록됨 → 건너뜀`);
      return null;
    }

    // ETH 단위 → wei 변환 (예: "0.1" → 100000000000000000n)
    const priceWei = ethers.parseEther(priceEth);

    const tx = await contract.registerParcel(BigInt(dbParcelId), name, priceWei);
    const receipt = await tx.wait(1);

    console.log(
      `[LandNFT] 구역 #${dbParcelId} "${name}" 온체인 등록 완료! tx: ${receipt.hash}`
    );
    return receipt.hash as string;
  } catch (err: any) {
    // "already registered" 컨트랙트 revert도 조용히 처리
    if (err?.reason?.includes("already registered")) {
      console.log(`[LandNFT] 구역 #${dbParcelId} 이미 등록됨 (revert)`);
      return null;
    }
    console.error(`[LandNFT] 구역 #${dbParcelId} 등록 실패:`, err.message);
    throw err;
  }
}

/**
 * 컨트랙트에서 구역 정보를 조회합니다.
 * @returns { name, price, registered, sold }
 */
export async function getParcelOnChain(dbParcelId: number) {
  const { signer, data } = getAdminSigner();
  const contract = new ethers.Contract(
    data.LandNFT.address,
    data.LandNFT.abi,
    signer
  );
  return contract.getParcel(BigInt(dbParcelId));
}
