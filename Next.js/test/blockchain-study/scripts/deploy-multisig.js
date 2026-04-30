const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("🔐 다중 서명 지갑 (MultiSig Wallet) 배포 시작");
  console.log("==================================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // 로컬 Ganache의 테스트 계정 3개를 공동 소유자로 설정
  const ownerKeys = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // Account 0
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d", // Account 1
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"  // Account 2
  ];

  const owners = ownerKeys.map(k => new ethers.Wallet(k, provider));
  const deployer = new ethers.NonceManager(owners[0]); // 0번 계정이 배포를 담당

  const ownerAddresses = owners.map(o => o.address);
  const requiredConfirmations = 2; // 3명 중 2명의 서명이 필요함

  console.log(`  👥 지갑 공동 소유자 (3명):`);
  ownerAddresses.forEach((addr, i) => console.log(`     ${i+1}. ${addr}`));
  console.log(`  ✍️  필요 결재 수 (Threshold): ${requiredConfirmations}명\n`);

  console.log("  🔨 컴파일 중: MultiSigWallet.sol...");
  const { abi, bytecode } = compile("MultiSigWallet.sol", "MultiSigWallet");
  
  console.log("  ⏳ 블록체인에 금고 컨트랙트 배포 중...");
  const factory = new ethers.ContractFactory(abi, bytecode, deployer);
  // 생성자에 [소유자 배열]과 [필수 서명 수]를 전달합니다.
  const contract = await factory.deploy(ownerAddresses, requiredConfirmations);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log(`  ✅ MultiSigWallet 배포 성공!`);
  console.log(`  📍 금고 주소: ${address}\n`);

  // 배포 정보 저장 (프론트엔드 연동용)
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir, { recursive: true });
  
  const savePath = path.join(deployedDir, "multisig-address.json");
  const saveData = { 
    address, 
    abi, 
    owners: ownerAddresses, 
    requiredConfirmations 
  };
  fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));

  console.log(`  💾 저장 완료: ${savePath}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("배포 중 오류:", err);
  process.exit(1);
});
