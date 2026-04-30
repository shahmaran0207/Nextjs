/**
 * register-dao-proposals.js
 * ──────────────────────────────────────────────────────────────────
 * DB(PostgreSQL)의 dao_proposals를 LandDAO 컨트랙트에 재등록합니다.
 * start-all.js 에서 Ganache 재시작 후 자동 호출됩니다.
 *
 * [실행 방법]
 *   cd blockchain-study
 *   node scripts/register-dao-proposals.js
 * ──────────────────────────────────────────────────────────────────
 */

const { ethers }    = require("ethers");
const { PrismaClient } = require("@prisma/client");
const fs   = require("fs");
const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
} catch (_) {}

const prisma = new PrismaClient();

async function main() {
  // ── 1. 배포 정보 로드 ─────────────────────────────────────────
  const daoPath = path.join(__dirname, "..", "deployed", "land-dao-address.json");
  if (!fs.existsSync(daoPath)) {
    console.log("⚠️  land-dao-address.json 없음 — 건너뜀");
    return;
  }
  const daoInfo = JSON.parse(fs.readFileSync(daoPath, "utf-8"));

  // ── 2. 컨트랙트 연결 ──────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider(daoInfo.rpcUrl ?? "http://127.0.0.1:8545");
  const deployer = new ethers.Wallet(
    process.env.ADMIN_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const contract = new ethers.Contract(daoInfo.LandDAO.address, daoInfo.LandDAO.abi, deployer);

  try { await provider.getNetwork(); } catch {
    console.log("⚠️  Ganache 연결 불가 — 제안 재등록 건너뜀");
    return;
  }

  // ── 3. DB에서 재등록 대상 조회 ────────────────────────────────
  // contract_proposal_id가 없거나(이전에 실패), status=active인 제안만 대상
  const now = Math.floor(Date.now() / 1000);
  const proposals = await prisma.dao_proposals.findMany({
    where: {
      status: "active",
      // deadline이 이미 지난 제안은 제외
      OR: [
        { deadline_timestamp: null },
        { deadline_timestamp: { gt: BigInt(now) } },
      ],
    },
    orderBy: { created_at: "asc" },
  });

  if (proposals.length === 0) {
    console.log("  ℹ️  재등록할 DAO 제안 없음");
    return;
  }

  console.log(`\n  📋 ${proposals.length}개 제안 컨트랙트 재등록 중...\n`);

  let success = 0, skipped = 0;

  for (const p of proposals) {
    try {
      // 컨트랙트 현재 제안 수 확인 — 이미 등록됐는지 체크
      const count = Number(await contract.proposalCount());
      if (p.contract_proposal_id && p.contract_proposal_id <= count) {
        // 이미 등록된 제안 ID가 유효한 범위 내에 있으면 건너뜀
        try {
          await contract.getProposal(p.contract_proposal_id);
          console.log(`  ⏩ #${p.id} "${p.description.slice(0, 30)}..." → 이미 등록됨`);
          skipped++;
          continue;
        } catch (_) {
          // getProposal 실패 → 재등록 필요
        }
      }

      // propose() 트랜잭션
      const tx      = await contract.propose(p.description);
      const receipt = await tx.wait(1);

      // 새 proposal_id 조회 (tx 후 proposalCount가 1 증가)
      const newCount   = Number(await contract.proposalCount());
      const newProposal = await contract.getProposal(newCount);

      // DB 업데이트
      await prisma.dao_proposals.update({
        where: { id: p.id },
        data:  {
          contract_proposal_id: newCount,
          deadline_timestamp:   BigInt(Number(newProposal.deadline)),
        },
      });

      console.log(`  ✅ #${p.id} "${p.description.slice(0, 30)}..." → 컨트랙트 #${newCount}`);
      success++;

    } catch (err) {
      console.error(`  ❌ #${p.id} 재등록 실패:`, err.reason ?? err.message);
    }
  }

  console.log(`\n  재등록 완료: ${success}개 성공, ${skipped}개 건너뜀`);
}

main()
  .catch(err => {
    console.error("❌ 스크립트 실패:", err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
