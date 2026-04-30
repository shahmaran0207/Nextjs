const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("⏳ 토큰 베스팅 (Token Vesting) 배포 시작");
  console.log("==================================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // 배포자 (프로젝트 재단)
  const deployerWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
    provider
  );
  const deployer = new ethers.NonceManager(deployerWallet);

  // 수혜자 (토큰을 받을 개발팀 계정) -> Account 1
  const beneficiaryWallet = new ethers.Wallet(
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    provider
  );

  // 1. 실습용 팀 토큰 배포 (TokenA 사용)
  console.log("  [1/3] 실습용 팀 토큰(TKA) 배포 중...");
  const { abi: tokenAbi, bytecode: tokenBytecode } = compile("TokenA.sol", "TokenA");
  const tokenFactory = new ethers.ContractFactory(tokenAbi, tokenBytecode, deployer);
  const tokenContract = await tokenFactory.deploy();
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  console.log(`  ✅ 팀 토큰 배포 완료: ${tokenAddress}\n`);

  // 2. 베스팅 컨트랙트 배포
  console.log("  [2/3] 베스팅(Vesting) 컨트랙트 배포 중...");
  
  // 현재 시간 구하기 (블록체인 기준 초 단위)
  const currentBlock = await provider.getBlock("latest");
  const startTimestamp = currentBlock.timestamp;
  
  // 실습을 위해 시간을 매우 짧게 잡습니다.
  const cliffDuration = 60;      // 절벽 기간: 1분 (1분 동안은 아예 못 뺌)
  const totalDuration = 5 * 60;  // 총 베스팅 기간: 5분 (1분이 지나면 남은 4분동안 서서히 풀림)

  const { abi: vestingAbi, bytecode: vestingBytecode } = compile("TokenVesting.sol", "TokenVesting");
  const vestingFactory = new ethers.ContractFactory(vestingAbi, vestingBytecode, deployer);
  
  const vestingContract = await vestingFactory.deploy(
    tokenAddress,
    beneficiaryWallet.address,
    startTimestamp,
    cliffDuration,
    totalDuration
  );
  await vestingContract.waitForDeployment();
  const vestingAddress = await vestingContract.getAddress();
  console.log(`  ✅ 베스팅 컨트랙트 배포 완료: ${vestingAddress}`);
  console.log(`     - 수혜자(개발팀): ${beneficiaryWallet.address}`);
  console.log(`     - 절벽(Cliff) 기간: ${cliffDuration}초`);
  console.log(`     - 총 잠금 해제 기간: ${totalDuration}초\n`);

  // 3. 베스팅 금고에 팀 물량 50만 개(500,000 TKA) 전송해서 잠그기
  console.log("  [3/3] 개발팀 물량 500,000 TKA 락업(잠금) 중...");
  const lockAmount = ethers.parseEther("500000");
  const tx = await tokenContract.transfer(vestingAddress, lockAmount);
  await tx.wait();
  console.log("  ✅ 락업 완료! 이제 이 물량은 코드의 법칙에 의해서만 풀립니다.\n");

  // 프론트엔드 연동용 데이터 저장
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir, { recursive: true });
  
  const savePath = path.join(deployedDir, "vesting-address.json");
  const saveData = {
    vestingAddress,
    vestingAbi,
    tokenAddress,
    tokenAbi,
    beneficiary: beneficiaryWallet.address,
    startTimestamp,
    cliffDuration,
    totalDuration,
    lockAmount: lockAmount.toString()
  };
  fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));

  console.log(`  💾 배포 정보 저장 완료: ${savePath}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("배포 중 오류:", err);
  process.exit(1);
});
