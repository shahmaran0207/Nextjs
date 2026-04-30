const { ethers } = require("ethers");
const { compile } = require("./compile");
const fs   = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";

async function main() {
  console.log("\n==================================================");
  console.log("🔄 업그레이더블 컨트랙트 (Proxy Pattern) 배포 시작");
  console.log("==================================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const rawWallet = new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // 하드햇 0번 계정
    provider
  );
  const deployer = new ethers.NonceManager(rawWallet);
  console.log(`  👤 배포자: ${rawWallet.address}\n`);

  // 1. 머리(Logic) V1 컴파일 및 배포
  console.log("  [1/3] LogicV1.sol (머리 V1) 배포 중...");
  const { abi: logicV1Abi, bytecode: logicV1Bytecode } = compile("LogicV1.sol", "LogicV1");
  const logicV1Factory = new ethers.ContractFactory(logicV1Abi, logicV1Bytecode, deployer);
  const logicV1Contract = await logicV1Factory.deploy();
  await logicV1Contract.waitForDeployment();
  const logicV1Address = await logicV1Contract.getAddress();
  console.log(`  ✅ LogicV1 배포 완료: ${logicV1Address}\n`);

  // 2. 머리(Logic) V2 컴파일 및 배포
  // (실제 서비스에서는 나중에 배포하지만, 실습 편의상 한 번에 다 배포합니다)
  console.log("  [2/3] LogicV2.sol (머리 V2) 배포 중...");
  const { abi: logicV2Abi, bytecode: logicV2Bytecode } = compile("LogicV2.sol", "LogicV2");
  const logicV2Factory = new ethers.ContractFactory(logicV2Abi, logicV2Bytecode, deployer);
  const logicV2Contract = await logicV2Factory.deploy();
  await logicV2Contract.waitForDeployment();
  const logicV2Address = await logicV2Contract.getAddress();
  console.log(`  ✅ LogicV2 배포 완료: ${logicV2Address}\n`);

  // 3. 몸통(Proxy) 컴파일 및 배포 (초기 머리를 V1으로 설정)
  console.log("  [3/3] SimpleProxy.sol (몸통) 배포 중...");
  const { abi: proxyAbi, bytecode: proxyBytecode } = compile("SimpleProxy.sol", "SimpleProxy");
  const proxyFactory = new ethers.ContractFactory(proxyAbi, proxyBytecode, deployer);
  // 생성자에 V1의 주소를 넣어줍니다.
  const proxyContract = await proxyFactory.deploy(logicV1Address);
  await proxyContract.waitForDeployment();
  const proxyAddress = await proxyContract.getAddress();
  console.log(`  ✅ Proxy 배포 완료: ${proxyAddress}\n`);

  // 프론트엔드 연동을 위한 데이터 저장
  // 매우 중요: 프론트엔드는 주소는 Proxy 주소를 쓰지만, ABI(설명서)는 Logic의 것을 써야 합니다!
  // 그래야 Ethers.js가 "Proxy 주소에 V1/V2의 함수가 있다"고 믿고 요청을 보냅니다.
  const deployedDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(deployedDir)) fs.mkdirSync(deployedDir, { recursive: true });
  
  const savePath = path.join(deployedDir, "proxy-address.json");
  const saveData = {
    proxyAddress: proxyAddress, // 유저가 무조건 접속해야 할 단 하나의 주소
    proxyAbi: proxyAbi,         // (업그레이드 함수 호출용)
    logicV1Address: logicV1Address,
    logicV1Abi: logicV1Abi,     // (데이터 조작용 설명서)
    logicV2Address: logicV2Address,
    logicV2Abi: logicV2Abi      // (데이터 조작용 설명서)
  };
  fs.writeFileSync(savePath, JSON.stringify(saveData, null, 2));

  console.log(`  💾 프록시 정보 저장 완료: ${savePath}`);
  console.log("==================================================\n");
}

main().catch((err) => {
  console.error("배포 중 오류:", err);
  process.exit(1);
});
