const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

// Chainlink ETH/USD 초기 가격 설정 ($3,000 = 300000000000, 소수점 8자리)
const INITIAL_ETH_PRICE = 300000000000n; // $3,000

async function main() {
  console.log("\n==================================================");
  console.log("🔮 Oracle 프로젝트: Chainlink Mock 배포 시작");
  console.log("==================================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rawWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const deployer = new ethers.NonceManager(rawWallet);
  console.log(`  👤 배포자: ${rawWallet.address}`);

  // 1. MockV3Aggregator 배포 (가짜 Chainlink 가격 피드)
  console.log("\n  🔨 컴파일: MockV3Aggregator.sol...");
  const { abi: mockAbi, bytecode: mockBytecode } = compile("MockV3Aggregator.sol", "MockV3Aggregator");
  console.log("  ✅ 컴파일 완료");

  console.log("  ⏳ MockV3Aggregator 배포 중...");
  const mockFactory = new ethers.ContractFactory(mockAbi, mockBytecode, deployer);
  // 생성자: (소수점 자리수, 초기 가격)
  // ETH/USD = 8자리 소수점, $3,000 설정
  const mockFeed = await mockFactory.deploy(8, INITIAL_ETH_PRICE);
  await mockFeed.waitForDeployment();
  const mockAddress = await mockFeed.getAddress();
  console.log(`  ✅ MockV3Aggregator 배포! 주소: ${mockAddress}`);
  console.log(`     초기 ETH/USD 가격: $3,000 (${INITIAL_ETH_PRICE})`);

  // 2. PriceFeedConsumer 배포 (Mock 주소를 Chainlink 피드 주소로 사용)
  console.log("\n  🔨 컴파일: PriceFeedConsumer.sol...");
  const { abi, bytecode } = compile("PriceFeedConsumer.sol", "PriceFeedConsumer");
  console.log("  ✅ 컴파일 완료");

  console.log("  ⏳ PriceFeedConsumer 배포 중...");
  const consumerFactory = new ethers.ContractFactory(abi, bytecode, deployer);
  const consumer = await consumerFactory.deploy(mockAddress);
  await consumer.waitForDeployment();
  const consumerAddress = await consumer.getAddress();
  console.log(`  ✅ PriceFeedConsumer 배포! 주소: ${consumerAddress}`);

  // 3. 실제로 가격 조회 테스트
  const consumerContract = new ethers.Contract(consumerAddress, abi, rawWallet);
  const rawPrice = await consumerContract.getLatestPrice();
  const formattedPrice = await consumerContract.getFormattedPrice();

  console.log("\n  📊 가격 조회 테스트:");
  console.log(`     rawPrice (8자리 소수): ${rawPrice}`);
  console.log(`     실제 달러 가격: $${Number(rawPrice) / 1e8}`);
  console.log(`     formatEther 결과: $${ethers.formatEther(formattedPrice)}`);

  // 4. 배포 정보 저장
  const deployedDir = path.join(__dirname, "..", "deployed");
  const saveData = {
    consumerAddress,
    mockFeedAddress: mockAddress,
    abi,
    mockAbi,
    initialPrice: INITIAL_ETH_PRICE.toString(),
  };
  const savePath = path.join(deployedDir, "oracle-address.json");
  fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));
  console.log(`\n  💾 저장: ${savePath}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("Oracle 배포 중 오류:", err);
  process.exit(1);
});
