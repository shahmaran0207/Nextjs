/**
 * deploy-mynft.js
 * ──────────────────────────────────────────────────────────────────
 * MyNFT 컨트랙트를 Ganache(Chain A, 8545)에 배포합니다.
 *
 * [실행 방법]
 *   cd blockchain-study
 *   node scripts/deploy-mynft.js
 * ──────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

try {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
} catch (_) {}

const RPC_URL = "http://127.0.0.1:8545"; // Chain A (Ganache)

async function main() {
  console.log("\n🎨 MyNFT 컨트랙트 배포 시작");
  console.log("=".repeat(50));

  // ── 1. 컴파일 ──────────────────────────────────────────────────
  const { abi, bytecode } = compile("MyNFT.sol", "MyNFT");

  // ── 2. 배포자 연결 ─────────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deployer = new ethers.Wallet(
    process.env.ADMIN_PRIVATE_KEY ??
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );

  const balance = await provider.getBalance(deployer.address);
  console.log(`\n  👤 배포자: ${deployer.address}`);
  console.log(`  💰 잔액: ${ethers.formatEther(balance)} ETH`);

  // ── 3. 배포 ────────────────────────────────────────────────────
  // 생성자 인수: mintPrice(0 = 무료), maxSupply(0 = 무제한)
  const factory  = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy(
    ethers.parseEther("0"),   // mintPrice: 무료
    0                         // maxSupply: 무제한
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`\n  ✅ MyNFT 배포 성공!`);
  console.log(`  📍 주소: ${address}`);

  // ── 4. 배포 정보 저장 ──────────────────────────────────────────
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir, { recursive: true });

  const outputPath = path.join(deployedDir, "mynft-address.json");
  fs.writeFileSync(outputPath, JSON.stringify({
    rpcUrl: RPC_URL,
    MyNFT:  { address, abi }
  }, null, 2));

  console.log(`  💾 저장: ${outputPath}`);
  console.log("\n" + "=".repeat(50));
}

main().catch(err => {
  console.error("❌ 배포 실패:", err.message);
  process.exit(1);
});
