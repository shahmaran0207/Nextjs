/**
 * register-parcel.js
 * ──────────────────────────────────────────────────────────────────
 * DB(PostgreSQL)에 있는 land_parcels를 LandNFT 컨트랙트에 일괄 등록합니다.
 * 이미 등록된 구역은 건너뜁니다.
 *
 * [실행 방법]
 *   cd blockchain-study
 *   node scripts/register-parcel.js           ← DB의 모든 available 구역 등록
 *   node scripts/register-parcel.js 3         ← parcelId=3인 구역만 등록
 *
 * [필요 조건]
 *   - Ganache가 실행 중이어야 합니다 (npm run start:all)
 *   - .env에 DATABASE_URL이 설정되어 있어야 합니다
 *   - LandNFT가 배포된 상태여야 합니다 (deploy-land-nft.js 먼저 실행)
 * ──────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
// blockchain-study에는 @prisma/client가 없으므로 루트 generated 경로를 직접 사용
const { PrismaClient } = require("../../app/generated/prisma");
const fs = require("fs");
const path = require("path");

// dotenv로 .env 파일 로드 (DATABASE_URL 등)
try {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
} catch (e) {
  console.warn("dotenv 없음, 환경 변수를 직접 사용합니다.");
}

const prisma = new PrismaClient();

async function main() {
  // ── 1. 배포 정보 로드 ─────────────────────────────────────────────
  const deployedPath = path.join(__dirname, "..", "deployed", "land-nft-address.json");
  if (!fs.existsSync(deployedPath)) {
    console.error("❌ land-nft-address.json 없음. deploy-land-nft.js를 먼저 실행하세요.");
    process.exit(1);
  }
  const deployed = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
  console.log(`📄 컨트랙트 주소: ${deployed.LandNFT.address}`);

  // ── 2. Ganache 연결 + 관리자 Signer ──────────────────────────────
  const provider  = new ethers.JsonRpcProvider(deployed.rpcUrl ?? "http://127.0.0.1:8545");
  const deployer  = new ethers.Wallet(
    // 테스트 전용 개인키 (실제 서비스에서는 .env 사용)
    process.env.ADMIN_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const contract = new ethers.Contract(
    deployed.LandNFT.address,
    deployed.LandNFT.abi,
    deployer
  );

  try { await provider.getNetwork(); } catch {
    console.error("❌ Ganache에 연결할 수 없습니다. npm run start:all 먼저 실행하세요.");
    process.exit(1);
  }

  // ── 3. 등록할 구역 조회 ────────────────────────────────────────────
  const targetId = process.argv[2] ? Number(process.argv[2]) : null;

  const parcels = await prisma.land_parcels.findMany({
    where: {
      status: "available",
      ...(targetId ? { id: targetId } : {}),
    },
    orderBy: { id: "asc" },
  });

  if (parcels.length === 0) {
    console.log("⚠️  등록할 구역이 없습니다 (status=available인 구역이 DB에 없음).");
    return;
  }

  console.log(`\n📦 ${parcels.length}개 구역을 컨트랙트에 등록합니다...\n`);

  // ── 4. 구역별 등록 ─────────────────────────────────────────────────
  let success = 0, skipped = 0, failed = 0;

  for (const parcel of parcels) {
    try {
      // 이미 등록됐는지 확인
      const info = await contract.getParcel(BigInt(parcel.id));
      if (info.registered) {
        console.log(`  ⏩ #${parcel.id} "${parcel.name}" → 이미 등록됨 (건너뜀)`);
        skipped++;
        continue;
      }

      // price_eth 검증 (DB 값이 비정상이면 기본값 0.1 사용)
      const priceEth = String(parcel.price_eth || "0.1");
      const priceWei = ethers.parseEther(priceEth);

      const tx = await contract.registerParcel(
        BigInt(parcel.id),
        parcel.name,
        priceWei
      );
      const receipt = await tx.wait(1);

      console.log(`  ✅ #${parcel.id} "${parcel.name}" (${priceEth} ETH) → tx: ${receipt.hash.slice(0, 20)}...`);
      success++;

    } catch (err) {
      if (err?.reason?.includes("already registered")) {
        console.log(`  ⏩ #${parcel.id} "${parcel.name}" → 이미 등록됨 (revert, 건너뜀)`);
        skipped++;
      } else {
        console.error(`  ❌ #${parcel.id} "${parcel.name}" 등록 실패:`, err.reason ?? err.message);
        failed++;
      }
    }
  }

  // ── 5. 결과 요약 ────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(50));
  console.log(`✅ 등록 완료: ${success}개`);
  console.log(`⏩ 이미 등록: ${skipped}개`);
  if (failed > 0) console.log(`❌ 실패: ${failed}개`);
  console.log("═".repeat(50));
  console.log("\n이제 지도에서 랜드 모드 → 구역 클릭 → 구매하기 버튼이 작동합니다!");
}

main()
  .catch((err) => {
    console.error("❌ 스크립트 실패:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
