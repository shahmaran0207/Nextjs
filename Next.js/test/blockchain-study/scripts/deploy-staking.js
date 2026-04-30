const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545"; // 로컬 블록체인 포트

async function main() {
  console.log("\n==================================================");
  console.log("🏦 DeFi 프로젝트: Staking(예치 금고) 배포 시작");
  console.log("==================================================\n");

  // 1. 이미 배포된 RewardToken 주소 읽어오기
  const deployedDir = path.join(__dirname, "..", "deployed");
  const defiPath = path.join(deployedDir, "defi-address.json");
  if (!fs.existsSync(defiPath)) {
    throw new Error("RewardToken이 먼저 배포되어야 합니다. (defi-address.json 없음)");
  }
  const defiData = JSON.parse(fs.readFileSync(defiPath, "utf-8"));
  const rewardTokenAddress = defiData.address;
  const rewardTokenABI = defiData.abi;
  console.log(`  🔗 연동할 토큰(RWD) 주소: ${rewardTokenAddress}\n`);

  // 2. Staking.sol 컴파일
  console.log("🔨 컴파일 중: Staking.sol...");
  const { abi, bytecode } = compile("Staking.sol", "Staking");
  console.log(`✅ Staking 컴파일 완료! (ABI 함수 수: ${abi.length}개)\n`);

  // 3. 배포자 지갑 설정
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rawWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Ganache 첫 번째 계정 기본키
    provider
  );
  // NonceManager: 여러 트랜잭션 연속 실행 시 nonce를 자동 추적하여 충돌 방지
  const deployer = new ethers.NonceManager(rawWallet);
  console.log(`  👤 배포자 주소: ${rawWallet.address}`);

  // 4. 블록체인에 배포 (생성자 인수로 rewardTokenAddress 전달)
  console.log("⏳ 블록체인에 배포 중...");
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy(rewardTokenAddress);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log("\n  ✅ Staking 컨트랙트 배포 성공!");
  console.log(`  📍 금고 주소: ${address}`);

  // 5. [Phase 3 추가] 이자 지급을 위해 은행 금고에 RWD 토큰 미리 충전
  // 은행이 이자를 줄 돈이 있어야 하므로, 배포자가 10,000 RWD를 금고에 입금해둠
  console.log("\n  💰 은행 금고에 이자용 RWD 토큰 충전 중...");
  const rewardToken = new ethers.Contract(rewardTokenAddress, rewardTokenABI, deployer);
  const fundAmount = ethers.parseEther("10000"); // 이자 지급용 10,000 RWD
  const transferTx = await rewardToken.transfer(address, fundAmount);
  await transferTx.wait();
  console.log(`  ✅ 이자용 10,000 RWD 충전 완료!`);

  // 6. 배포 정보 저장 (프론트엔드 연동용)
  const deployInfo = {
    address: address,
    abi: abi,
  };

  const savePath = path.join(deployedDir, "staking-address.json");
  fs.writeFileSync(savePath, JSON.stringify(deployInfo, null, 2));
  console.log(`  💾 저장: ${savePath}\n`);
  
  console.log("==================================================");
}

main().catch((error) => {
  console.error("배포 중 오류 발생:", error);
  process.exit(1);
});
