/**
 * deploy-land-nft.js
 * ─────────────────────────────────────────────────────────────────
 * LandNFT 컨트랙트를 Ganache Chain A (port 8545)에 배포하고
 * deployed/land-nft-address.json 파일로 저장합니다.
 *
 * [실행 방법]
 *   cd blockchain-study
 *   node scripts/deploy-land-nft.js
 *
 * [사전 조건]
 *   - Ganache가 http://127.0.0.1:8545 에서 실행 중이어야 함
 *   - (npm run start:all로 시작하면 자동으로 실행됨)
 * ─────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const fs         = require("fs");
const path       = require("path");
const { compile } = require("./compile");

async function main() {
  console.log("🚀 LandNFT 배포 시작\n");

  // ── 1. Ganache Chain A 연결 ───────────────────────────────────────
  const RPC_URL = "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  try {
    const network = await provider.getNetwork();
    console.log(`✅ Ganache Chain A 연결 성공! (Chain ID: ${network.chainId})`);
  } catch (e) {
    console.error("❌ Ganache에 연결할 수 없습니다.");
    console.error("   npm run start:all 로 서버를 먼저 시작하세요.");
    process.exit(1);
  }

  // ── 2. 배포자 계정 설정 ─────────────────────────────────────────────
  // Ganache 기본 계정 #0 개인키 (테스트 전용)
  const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const deployer     = new ethers.Wallet(DEPLOYER_KEY, provider);

  // 수혜자: 배포자 계정 #1 (판매 수익 수신)
  // Ganache 기본 계정 #1 주소 (항상 동일)
  const BENEFICIARY = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

  const balance = await provider.getBalance(deployer.address);
  console.log(`\n👤 배포자 주소: ${deployer.address}`);
  console.log(`💰 배포자 잔액: ${ethers.formatEther(balance)} ETH`);
  console.log(`🏦 수혜자 주소: ${BENEFICIARY}`);

  // ── 3. LandNFT.sol 컴파일 ───────────────────────────────────────────
  const { abi, bytecode } = compile("LandNFT.sol", "LandNFT");

  // ── 4. 배포 ─────────────────────────────────────────────────────────
  console.log("\n📦 LandNFT 배포 중...");
  const factory  = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy(BENEFICIARY);
  const receipt  = await contract.deploymentTransaction().wait(1);
  const address  = receipt.contractAddress;

  console.log(`✅ LandNFT 배포 완료! 주소: ${address}`);

  // ── 5. 배포 정보 저장 ───────────────────────────────────────────────
  const outputDir  = path.join(__dirname, "..", "deployed");
  const outputPath = path.join(outputDir, "land-nft-address.json");

  const deployedData = {
    network:      "Chain A (localhost:8545)",
    chainId:      31337,
    deployedAt:   new Date().toISOString(),
    deployer:     deployer.address,
    beneficiary:  BENEFICIARY,
    LandNFT: {
      address,
      abi,
    },
  };

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  fs.writeFileSync(outputPath, JSON.stringify(deployedData, null, 2));
  console.log(`\n📄 배포 정보 저장: ${outputPath}`);

  // ── 6. 배포 요약 ────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log("🎉 LandNFT 배포 완료!");
  console.log("═".repeat(60));
  console.log(`  컨트랙트 주소: ${address}`);
  console.log(`  Chain ID     : 31337 (Ganache Chain A)`);
  console.log(`  RPC URL      : ${RPC_URL}`);
  console.log("═".repeat(60));
  console.log("\n다음 단계:");
  console.log("  1. MetaMask → Chain A 네트워크 (http://127.0.0.1:8545, ChainID: 31337)");
  console.log("  2. 지도에서 🏠 랜드 모드 → 구역 그리기 → DB에 구역 등록");
  console.log("  3. node scripts/register-parcel.js <parcelId> <name> <priceInWei>");
  console.log("     로 컨트랙트에 구역 등록 후 구매 가능");
}

main().catch((err) => {
  console.error("❌ 배포 실패:", err.message);
  process.exit(1);
});
