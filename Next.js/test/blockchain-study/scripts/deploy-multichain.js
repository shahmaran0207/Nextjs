/**
 * deploy-multichain.js
 * ─────────────────────────────────────────────────────────────────
 * PaymentReceiver.sol을 3개의 로컬 Ganache 체인에 동시 배포합니다.
 *
 * [실행 전 필수 조건]
 * 다음 3개의 Ganache를 모두 실행한 뒤 이 스크립트를 실행하세요:
 *
 *   Chain A: npx ganache --chain.chainId 1337 --server.port 8545 \
 *              --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
 *
 *   Chain B: npx ganache --chain.chainId 1338 --server.port 8546 \
 *              --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
 *
 *   Chain C: npx ganache --chain.chainId 1339 --server.port 8547 \
 *              --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
 *
 * [실행]
 *   node scripts/deploy-multichain.js
 * ─────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const fs         = require("fs");
const path       = require("path");
const { compile } = require("./compile");

// ── 배포할 3개 체인 설정 ──────────────────────────────────────────
const CHAINS = [
  { name: "Chain A", chainId: 1337, rpcUrl: "http://127.0.0.1:8545" },
  { name: "Chain B", chainId: 1338, rpcUrl: "http://127.0.0.1:8546" },
  { name: "Chain C", chainId: 1339, rpcUrl: "http://127.0.0.1:8547" },
];

// 모든 체인에서 동일한 배포자 개인키 사용 (Ganache 기본 계정 #0)
// ★ 실제 서비스에서는 절대 코드에 개인키를 하드코딩하면 안 됨!
const DEPLOYER_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function deployToChain(chain, abi, bytecode) {
  console.log(`\n📡 ${chain.name} (chainId: ${chain.chainId}) 배포 시작...`);

  // 해당 체인의 Ganache에 연결
  const provider = new ethers.JsonRpcProvider(chain.rpcUrl);

  // 연결 확인
  try {
    const network = await provider.getNetwork();
    console.log(`  ✅ 연결 성공 (실제 chainId: ${network.chainId})`);
  } catch (e) {
    console.error(`  ❌ ${chain.name}에 연결 실패. Ganache가 실행 중인지 확인하세요.`);
    console.error(`     RPC URL: ${chain.rpcUrl}`);
    throw e;
  }

  const deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  const balance  = await provider.getBalance(deployer.address);
  console.log(`  👤 배포자: ${deployer.address}`);
  console.log(`  💰 잔액:   ${ethers.formatEther(balance)} ETH`);

  // 컨트랙트 배포
  const factory  = new ethers.ContractFactory(abi, bytecode, deployer);
  const contract = await factory.deploy();
  // constructor 인자 없음 — PaymentReceiver()는 인자 없이 배포

  const receipt  = await contract.deploymentTransaction().wait(1);
  const address  = receipt.contractAddress;

  console.log(`  🚀 PaymentReceiver 배포 완료!`);
  console.log(`  📍 주소: ${address}`);

  return address;
}

async function main() {
  console.log("🌐 멀티체인 배포 스크립트 시작\n");
  console.log("=".repeat(60));

  // PaymentReceiver.sol 컴파일 (한 번만)
  const compiled = compile("PaymentReceiver.sol", "PaymentReceiver");
  console.log(`✅ 컴파일 성공! (ABI 함수 수: ${compiled.abi.length}개)\n`);

  // 3개 체인에 순서대로 배포
  const results = {};
  for (const chain of CHAINS) {
    const address = await deployToChain(chain, compiled.abi, compiled.bytecode);
    results[chain.name] = {
      chainId: chain.chainId,
      rpcUrl:  chain.rpcUrl,
      address,
    };
  }

  // ── 배포 결과를 JSON으로 저장 ─────────────────────────────────
  // 프론트엔드와 결제 서버가 이 파일을 읽어 컨트랙트 주소를 사용
  const outputDir  = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const outputData = {
    deployedAt: new Date().toISOString(),
    abi: compiled.abi,  // ABI는 3개 체인 모두 동일
    chains: results,
  };

  const outputPath = path.join(outputDir, "multichain-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
  console.log(`\n📄 배포 정보 저장: ${outputPath}`);

  // ── 배포 요약 ─────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  console.log("🎉 멀티체인 배포 완료!");
  console.log("=".repeat(60));
  for (const [name, info] of Object.entries(results)) {
    console.log(`  ${name} (chainId: ${info.chainId}): ${info.address}`);
  }
  console.log("=".repeat(60));
  console.log("\n다음 단계: node server/index.js 로 결제 서버 실행");
}

main().catch((err) => {
  console.error("\n❌ 배포 실패:", err.message);
  process.exit(1);
});
