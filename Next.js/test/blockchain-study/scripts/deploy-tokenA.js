const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("🔄 DEX 프로젝트: TokenA 배포 시작");
  console.log("==================================================\n");

  // 1. TokenA.sol 컴파일
  console.log("🔨 컴파일 중: TokenA.sol...");
  const { abi, bytecode } = compile("TokenA.sol", "TokenA");
  console.log(`✅ TokenA 컴파일 완료! (ABI 함수 수: ${abi.length}개)\n`);

  // 2. 배포자 지갑 설정
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rawWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const deployer = new ethers.NonceManager(rawWallet);
  console.log(`  👤 배포자 주소: ${rawWallet.address}`);

  // 3. 블록체인에 배포
  console.log("⏳ 블록체인에 배포 중...");
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n  ✅ TokenA 컨트랙트 배포 성공!");
  console.log(`  📍 TokenA 주소: ${address}`);

  // 4. 배포 정보 저장
  const deployedDir = path.join(__dirname, "..", "deployed");
  const deployInfo = { address, abi };
  const savePath = path.join(deployedDir, "tokenA-address.json");
  fs.writeFileSync(savePath, JSON.stringify(deployInfo, null, 2));
  console.log(`  💾 저장: ${savePath}\n`);

  // 5. 배포 후 현황 출력
  const tokenA = new ethers.Contract(address, abi, rawWallet);
  const balance = await tokenA.balanceOf(rawWallet.address);
  console.log(`  💰 배포자 초기 잔액: ${ethers.formatEther(balance)} TKA`);
  console.log("==================================================");
}

main().catch((error) => {
  console.error("배포 중 오류 발생:", error);
  process.exit(1);
});
