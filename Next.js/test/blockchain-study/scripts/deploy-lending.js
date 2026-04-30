const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("🏦 디파이 대출 (Lending Protocol) 배포 시작");
  console.log("==================================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // 배포자 (은행 역할)
  const deployerWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
    provider
  );
  const deployer = new ethers.NonceManager(deployerWallet);

  // 1. 대출해 줄 달러 코인 (Mock USDC/TokenA 활용) 배포
  console.log("  [1/4] 대출용 달러 코인(USDC) 컨트랙트 배포 중...");
  const { abi: tokenAbi, bytecode: tokenBytecode } = compile("TokenA.sol", "TokenA");
  const tokenFactory = new ethers.ContractFactory(tokenAbi, tokenBytecode, deployer);
  const tokenContract = await tokenFactory.deploy();
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  console.log(`  ✅ 달러 코인 배포 완료: ${tokenAddress}\n`);

  // 2. 체인링크 모의 오라클 배포 (초기 ETH 가격: $2000)
  console.log("  [2/4] 모의 오라클(Oracle) 배포 중...");
  const { abi: oracleAbi, bytecode: oracleBytecode } = compile("MockV3Aggregator.sol", "MockV3Aggregator");
  const oracleFactory = new ethers.ContractFactory(oracleAbi, oracleBytecode, deployer);
  const decimals = 8;
  const initialPrice = 2000n * 100000000n; // 2000 달러 (8자리 소수점 포함)
  const oracleContract = await oracleFactory.deploy(decimals, initialPrice);
  await oracleContract.waitForDeployment();
  const oracleAddress = await oracleContract.getAddress();
  console.log(`  ✅ 오라클 배포 완료 (초기 ETH = $2,000): ${oracleAddress}\n`);

  // 3. 렌딩(대출) 컨트랙트 배포
  console.log("  [3/4] 대출 은행(Lending) 컨트랙트 배포 중...");
  const { abi: lendingAbi, bytecode: lendingBytecode } = compile("Lending.sol", "Lending");
  const lendingFactory = new ethers.ContractFactory(lendingAbi, lendingBytecode, deployer);
  
  const lendingContract = await lendingFactory.deploy(tokenAddress, oracleAddress);
  await lendingContract.waitForDeployment();
  const lendingAddress = await lendingContract.getAddress();
  console.log(`  ✅ 대출 은행 배포 완료: ${lendingAddress}\n`);

  // 4. 은행 금고에 대출해 줄 달러 자금 채워넣기 (40만 달러)
  console.log("  [4/4] 대출 은행에 초기 자금(400,000 USDC) 예치 중...");
  const fundAmount = ethers.parseEther("400000"); // 40만 달러
  const tx = await tokenContract.transfer(lendingAddress, fundAmount);
  await tx.wait();
  console.log("  ✅ 예치 완료! 이제 유저들이 대출을 받을 수 있습니다.\n");

  // 프론트엔드 연동용 데이터 저장
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir, { recursive: true });
  
  const savePath = path.join(deployedDir, "lending-address.json");
  const saveData = {
    lendingAddress,
    lendingAbi,
    tokenAddress,
    tokenAbi,
    oracleAddress,
    oracleAbi
  };
  fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));

  console.log(`  💾 배포 정보 저장 완료: ${savePath}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("배포 중 오류:", err);
  process.exit(1);
});
