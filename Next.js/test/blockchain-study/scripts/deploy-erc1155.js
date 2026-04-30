const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("🎮 ERC-1155 멀티 토큰 배포 (GameItems)");
  console.log("==================================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  // Ganache 기본 테스트 계정 0번 (잔액 1000 ETH)
  const rawWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", 
    provider
  );
  const deployer = new ethers.NonceManager(rawWallet);
  console.log(`  👤 배포자: ${rawWallet.address}`);

  console.log("  🔨 컴파일 중: GameItems.sol...");
  const { abi, bytecode } = compile("GameItems.sol", "GameItems");
  console.log("  ✅ 컴파일 완료!");

  console.log("  ⏳ 블록체인에 배포 중...");
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`  ✅ GameItems 컨트랙트 배포 성공!`);
  console.log(`  📍 주소: ${address}`);

  // 배포 직후, 생성자(constructor)에서 지급된 아이템 확인
  const contractInst = new ethers.Contract(address, abi, rawWallet);
  
  // balanceOf(계정주소, 토큰ID) -> 특정 계정의 해당 아이템 수량 조회
  const goldBalance = await contractInst.balanceOf(rawWallet.address, 0); // GOLD(0)
  const swordBalance = await contractInst.balanceOf(rawWallet.address, 1); // SWORD(1)
  const potionBalance = await contractInst.balanceOf(rawWallet.address, 3); // POTION(3)
  
  console.log(`\n  🎁 배포자 초기 지급 내역 (배치 민팅 적용):`);
  console.log(`     - GOLD(0):    ${goldBalance} 개`);
  console.log(`     - SWORD(1):   ${swordBalance} 개`);
  console.log(`     - POTION(3):  ${potionBalance} 개`);

  // 배포 정보 저장 (프론트엔드 연동용)
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir, { recursive: true });
  
  const savePath = path.join(deployedDir, "erc1155-address.json");
  const saveData = { address, abi };
  fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));

  console.log(`\n  💾 저장 완료: ${savePath}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("배포 중 오류:", err);
  process.exit(1);
});
