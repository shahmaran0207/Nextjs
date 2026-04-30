const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("🔄 DEX Phase 2: SimpleAMM 풀 배포 시작");
  console.log("==================================================\n");

  // 1. 이미 배포된 RWD, TKA 주소 읽기
  const deployedDir = path.join(__dirname, "..", "deployed");

  const defiData  = JSON.parse(fs.readFileSync(path.join(deployedDir, "defi-address.json"),  "utf-8"));
  const tokenAData = JSON.parse(fs.readFileSync(path.join(deployedDir, "tokenA-address.json"), "utf-8"));

  const rwdAddress  = defiData.address;
  const tkaAddress  = tokenAData.address;
  console.log(`  🔗 RWD 주소: ${rwdAddress}`);
  console.log(`  🔗 TKA 주소: ${tkaAddress}\n`);

  // 2. SimpleAMM.sol 컴파일
  console.log("🔨 컴파일 중: SimpleAMM.sol...");
  const { abi, bytecode } = compile("SimpleAMM.sol", "SimpleAMM");
  console.log(`✅ SimpleAMM 컴파일 완료! (ABI 함수 수: ${abi.length}개)\n`);

  // 3. 배포자 지갑
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rawWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
  const deployer = new ethers.NonceManager(rawWallet);
  console.log(`  👤 배포자 주소: ${rawWallet.address}`);

  // 4. SimpleAMM 배포 (생성자에 RWD, TKA 주소 전달)
  console.log("⏳ 블록체인에 배포 중...");
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const amm = await factory.deploy(rwdAddress, tkaAddress);
  await amm.waitForDeployment();

  const ammAddress = await amm.getAddress();
  console.log("\n  ✅ SimpleAMM 배포 성공!");
  console.log(`  📍 AMM 풀 주소: ${ammAddress}`);

  // 5. 초기 유동성 공급: RWD 1000개 + TKA 500개 → 초기 가격 = TKA 1개 = RWD 2개
  console.log("\n  💧 초기 유동성 공급 중...");
  const rwd = new ethers.Contract(rwdAddress, defiData.abi, deployer);
  const tka = new ethers.Contract(tkaAddress, tokenAData.abi, deployer);

  const rwd_amount = ethers.parseEther("1000");
  const tka_amount = ethers.parseEther("500");

  // Approve 두 토큰 모두
  await (await rwd.approve(ammAddress, rwd_amount)).wait();
  await (await tka.approve(ammAddress, tka_amount)).wait();

  // addLiquidity 호출
  const ammInstance = new ethers.Contract(ammAddress, abi, deployer);
  await (await ammInstance.addLiquidity(rwd_amount, tka_amount)).wait();

  // 풀 상태 확인
  const [resA, resB] = await ammInstance.getReserves();
  console.log(`  ✅ 초기 유동성 공급 완료!`);
  console.log(`     풀 RWD: ${ethers.formatEther(resA)} / 풀 TKA: ${ethers.formatEther(resB)}`);
  console.log(`     초기 환율: TKA 1개 = RWD ${ethers.formatEther(resA) / ethers.formatEther(resB)}개`);

  // 6. 배포 정보 저장
  const savePath = path.join(deployedDir, "amm-address.json");
  fs.writeFileSync(savePath, JSON.stringify({ address: ammAddress, abi }, null, 2));
  console.log(`  💾 저장: ${savePath}\n`);

  console.log("==================================================");
}

main().catch((error) => {
  console.error("배포 중 오류 발생:", error);
  process.exit(1);
});
