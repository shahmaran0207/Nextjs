/**
 * deploy-marketplace.js
 * ──────────────────────────────────────────────────────────────────
 * Marketplace 컨트랙트를 Ganache(Chain A, 8545)에 배포합니다.
 * MyNFT 컨트랙트가 먼저 배포되어 있어야 합니다.
 * ──────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
} catch (_) {}

const RPC_URL = "http://127.0.0.1:8545"; // Chain A

async function main() {
  console.log("\n🛒 Marketplace 컨트랙트 배포 시작");
  console.log("=".repeat(50));

  // 1. MyNFT 주소 읽어오기
  const deployedDir = path.join(__dirname, "..", "deployed");
  const mynftPath = path.join(deployedDir, "mynft-address.json");
  if (!fs.existsSync(mynftPath)) {
    throw new Error("MyNFT가 먼저 배포되어야 합니다. (mynft-address.json 없음)");
  }
  const mynftData = JSON.parse(fs.readFileSync(mynftPath, "utf-8"));
  const nftAddress = mynftData.MyNFT.address;

  // 2. 컴파일
  const { abi, bytecode } = compile("Marketplace.sol", "Marketplace");

  // 3. 배포자 연결
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deployer = new ethers.Wallet(
    process.env.ADMIN_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  console.log(`\n  🔗 연동할 NFT 주소: ${nftAddress}`);
  console.log(`  👤 배포자: ${deployer.address}`);

  // 4. 배포 (생성자 인수로 nftAddress 전달)
  const factory  = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy(nftAddress);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n  ✅ Marketplace 배포 성공!`);
  console.log(`  📍 마켓 주소: ${address}`);

  // 5. 배포 정보 저장
  const outputPath = path.join(deployedDir, "marketplace-address.json");
  fs.writeFileSync(outputPath, JSON.stringify({
    rpcUrl: RPC_URL,
    Marketplace: { address, abi }
  }, null, 2));

  console.log(`  💾 저장: ${outputPath}`);
  console.log("\n" + "=".repeat(50));
}

main().catch(err => {
  console.error("❌ 배포 실패:", err.message);
  process.exit(1);
});
