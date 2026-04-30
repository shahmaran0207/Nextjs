/**
 * restore-nft-ownership.js
 * ──────────────────────────────────────────────────────────────────
 * Ganache 재시작 후 DB(land_parcels)의 소유권 정보를
 * 새로 배포된 LandNFT 컨트랙트에 복원합니다.
 *
 * [실행 방법]
 *   cd blockchain-study
 *   node scripts/restore-nft-ownership.js
 *
 * [동작 원리]
 *   DB에서 status="owned" & owner_wallet!=null 인 구역을 조회해
 *   adminRestorePurchase()로 컨트랙트에 직접 복원합니다.
 *   (ETH 전송 없이 관리자 권한으로 소유권만 기록)
 * ──────────────────────────────────────────────────────────────────
 */

const { ethers }       = require("ethers");
// blockchain-study에는 @prisma/client가 없으므로 루트 generated 경로를 직접 사용
const { PrismaClient } = require("../../app/generated/prisma");
const fs   = require("fs");
const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
} catch (_) {}

const prisma = new PrismaClient();

async function main() {
  // ── 1. 배포 정보 로드 ─────────────────────────────────────────
  const deployedPath = path.join(__dirname, "..", "deployed", "land-nft-address.json");
  if (!fs.existsSync(deployedPath)) {
    console.log("⚠️  land-nft-address.json 없음 — 건너뜀");
    return;
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));

  // ── 2. 컨트랙트 연결 ──────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider(deployed.rpcUrl ?? "http://127.0.0.1:8545");
  const deployer = new ethers.Wallet(
    process.env.ADMIN_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const contract = new ethers.Contract(deployed.LandNFT.address, deployed.LandNFT.abi, deployer);

  try { await provider.getNetwork(); } catch {
    console.log("⚠️  Ganache 연결 불가 — NFT 복원 건너뜀");
    return;
  }

  // ── 3. DB에서 소유된 구역 조회 ────────────────────────────────
  const ownedParcels = await prisma.land_parcels.findMany({
    where: {
      status:       "owned",
      owner_wallet: { not: null },
    },
    orderBy: { id: "asc" },
  });

  if (ownedParcels.length === 0) {
    console.log("  ℹ️  복원할 NFT 소유권 없음");
    return;
  }

  console.log(`\n  🏠 ${ownedParcels.length}개 NFT 소유권 복원 중...\n`);

  let success = 0, skipped = 0, failed = 0;

  // nonce를 수동으로 관리해 연속 트랜잭션의 nonce 충돌 방지
  let nonce = await provider.getTransactionCount(deployer.address, "latest");

  for (const parcel of ownedParcels) {
    try {
      // 이미 컨트랙트에 등록됐는지 확인
      const info = await contract.getParcel(BigInt(parcel.id));
      if (info.registered) {
        console.log(`  ⏩ #${parcel.id} "${parcel.name}" → 이미 복원됨 (건너뜀)`);
        skipped++;
        continue;
      }

      // priceWei 계산
      const priceWei = ethers.parseEther(String(parcel.price_eth || "0.1"));

      // adminRestorePurchase 호출 (nonce 명시로 충돌 방지)
      const tx = await contract.adminRestorePurchase(
        BigInt(parcel.id),
        parcel.name,
        priceWei,
        parcel.owner_wallet,   // 원래 구매자 지갑 주소
        { nonce: nonce++ }     // 명시적 nonce
      );
      await tx.wait(1);

      console.log(`  ✅ #${parcel.id} "${parcel.name}" → ${parcel.owner_wallet?.slice(0, 10)}... 소유권 복원`);
      success++;

    } catch (err) {
      if (err?.message?.includes("already registered")) {
        console.log(`  ⏩ #${parcel.id} "${parcel.name}" → 이미 등록됨 (건너뜀)`);
        skipped++;
      } else {
        console.error(`  ❌ #${parcel.id} 복원 실패:`, err.reason ?? err.shortMessage ?? err.message);
        failed++;
        // 실패 시 실제 nonce 재조회해서 동기화
        nonce = await provider.getTransactionCount(deployer.address, "latest");
      }
    }
  }

  console.log(`\n  NFT 복원 완료: ${success}개 성공, ${skipped}개 건너뜀${failed > 0 ? `, ${failed}개 실패` : ""}`);
}

main()
  .catch(err => {
    console.error("❌ 스크립트 실패:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
