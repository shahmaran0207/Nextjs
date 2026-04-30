const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545"; // 로컬 블록체인 포트

async function main() {
  console.log("\n==================================================");
  console.log("🚀 DeFi 프로젝트: RewardToken(ERC-20) 배포 시작");
  console.log("==================================================\n");

  // 1. RewardToken.sol 컴파일
  console.log("🔨 컴파일 중: RewardToken.sol...");
  const { abi, bytecode } = compile("RewardToken.sol", "RewardToken");
  console.log(`✅ RewardToken 컴파일 완료! (ABI 함수 수: ${abi.length}개)\n`);

  // 2. 배포자 지갑 설정
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const deployer = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Ganache 첫 번째 계정 기본키
    provider
  );
  console.log(`  👤 배포자 주소: ${deployer.address}`);

  // 3. 블록체인에 배포
  console.log("⏳ 블록체인에 배포 중...");
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\n  ✅ RewardToken 배포 성공!");
  console.log(`  📍 토큰 주소: ${address}`);

  // 4. 배포 정보 저장 (프론트엔드 연동용)
  const deployInfo = {
    address: address,
    abi: abi,
  };

  const savePath = path.join(__dirname, "../deployed/defi-address.json");
  fs.writeFileSync(savePath, JSON.stringify(deployInfo, null, 2));
  console.log(`  💾 저장: ${savePath}\n`);
  
  console.log("==================================================");
}

main().catch((error) => {
  console.error("배포 중 오류 발생:", error);
  process.exit(1);
});
