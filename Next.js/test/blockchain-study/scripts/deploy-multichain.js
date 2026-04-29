/**
 * deploy-multichain.js
 * ─────────────────────────────────────────────────────────────────
 * 3개 Ganache 체인에 MockUSDC, MockDAI, PaymentReceiver를 배포합니다.
 *
 * [실행 전 필수: 3개 Ganache 실행]
 *   npx ganache --chain.chainId 1337 --server.port 8545 \
 *     --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
 *
 *   npx ganache --chain.chainId 1338 --server.port 8546 \
 *     --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
 *
 *   npx ganache --chain.chainId 1339 --server.port 8547 \
 *     --wallet.accounts "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,1000000000000000000000"
 *
 * [실행]
 *   node scripts/deploy-multichain.js
 *
 * [결과]
 *   deployed/multichain-addresses.json 에 체인별 컨트랙트 주소 저장
 * ─────────────────────────────────────────────────────────────────
 */

const { ethers } = require("ethers");
const fs         = require("fs");
const path       = require("path");
const { compile } = require("./compile");

// ── 3개 체인 설정 ─────────────────────────────────────────────────
// ⚠️ chainId는 Ganache --chain.chainId 옵션과 반드시 일치해야 함
// MetaMask에 네트워크 등록 시에도 이 값(31337/31338/31339)을 사용
const CHAINS = [
  { name: "Chain A", chainId: 31337, rpcUrl: "http://127.0.0.1:8545" },
  { name: "Chain B", chainId: 31338, rpcUrl: "http://127.0.0.1:8546" },
  { name: "Chain C", chainId: 31339, rpcUrl: "http://127.0.0.1:8547" },
];

// Ganache 기본 계정 #0 (테스트용 — 실서비스에서 절대 사용 금지)
const DEPLOYER_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// 테스트용 초기 발행량
const MINT_USDC = ethers.parseUnits("1000000", 6);  // 1,000,000 USDC (decimals=6)
const MINT_DAI  = ethers.parseUnits("1000000", 18); // 1,000,000 DAI  (decimals=18)

// ── 체인 1개에 배포 ───────────────────────────────────────────────
async function deployToChain(chain, receiverAbi, receiverBytecode, erc20Abi, erc20Bytecode) {
  console.log(`\n📡 [${chain.name}] chainId=${chain.chainId} 배포 시작...`);

  const provider = new ethers.JsonRpcProvider(chain.rpcUrl);

  // 연결 확인
  try {
    const net = await provider.getNetwork();
    console.log(`  ✅ 연결 성공 (chainId: ${net.chainId})`);
  } catch (e) {
    console.error(`  ❌ 연결 실패: ${chain.rpcUrl}`);
    throw e;
  }

  const deployer = new ethers.Wallet(DEPLOYER_KEY, provider);
  const bal = await provider.getBalance(deployer.address);
  console.log(`  👤 배포자: ${deployer.address}  잔액: ${ethers.formatEther(bal)} ETH`);

  // 현재 nonce를 명시적으로 읽어서 순서대로 사용 (이전 실패 트랜잭션으로 인한 nonce 꼬임 방지)
  let nonce = await deployer.getNonce();
  console.log(`  🔢 현재 nonce: ${nonce}`);

  // MockUSDC 배포
  const erc20Factory = new ethers.ContractFactory(erc20Abi, erc20Bytecode, deployer);
  const usdc = await erc20Factory.deploy("Mock USDC", "USDC", 6, { gasLimit: 3_000_000n, nonce: nonce++ });
  await usdc.deploymentTransaction().wait(1);
  const usdcAddress = await usdc.getAddress();
  console.log(`  🪙 MockUSDC: ${usdcAddress}`);

  // MockDAI 배포
  const dai = await erc20Factory.deploy("Mock DAI", "DAI", 18, { gasLimit: 3_000_000n, nonce: nonce++ });
  await dai.deploymentTransaction().wait(1);
  const daiAddress = await dai.getAddress();
  console.log(`  🪙 MockDAI:  ${daiAddress}`);

  // PaymentReceiver 배포
  const receiverFactory = new ethers.ContractFactory(receiverAbi, receiverBytecode, deployer);
  const receiver = await receiverFactory.deploy({ gasLimit: 3_000_000n, nonce: nonce++ });
  await receiver.deploymentTransaction().wait(1);
  const receiverAddress = await receiver.getAddress();
  console.log(`  📦 PaymentReceiver: ${receiverAddress}`);

  // 배포자 계정에 테스트 토큰 mint
  const usdcContract = new ethers.Contract(usdcAddress, erc20Abi, deployer);
  await (await usdcContract.mint(deployer.address, MINT_USDC, { gasLimit: 500_000n, nonce: nonce++ })).wait(1);
  console.log(`  💵 MockUSDC 1,000,000 mint 완료`);

  const daiContract = new ethers.Contract(daiAddress, erc20Abi, deployer);
  await (await daiContract.mint(deployer.address, MINT_DAI, { gasLimit: 500_000n, nonce: nonce++ })).wait(1);
  console.log(`  💵 MockDAI  1,000,000 mint 완료`);

  return {
    chainId:         chain.chainId,
    rpcUrl:          chain.rpcUrl,
    paymentReceiver: receiverAddress,
    tokens: {
      ETH:  { symbol: "ETH",  decimals: 18, address: null },
      USDC: { symbol: "USDC", decimals: 6,  address: usdcAddress },
      DAI:  { symbol: "DAI",  decimals: 18, address: daiAddress },
    },
  };
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  console.log("🌐 멀티코인 멀티체인 배포 시작");
  console.log("=".repeat(60));

  // 컴파일
  const receiver = compile("PaymentReceiver.sol", "PaymentReceiver");
  const erc20    = compile("MockERC20.sol", "MockERC20");

  // 3개 체인에 순서대로 배포
  const chains = {};
  for (const chain of CHAINS) {
    chains[chain.name] = await deployToChain(
      chain,
      receiver.abi, receiver.bytecode,
      erc20.abi,    erc20.bytecode
    );
  }

  // 결과 저장
  const outputDir = path.join(__dirname, "..", "deployed");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  const output = {
    deployedAt:          new Date().toISOString(),
    paymentReceiverAbi:  receiver.abi,
    erc20Abi:            erc20.abi,
    chains,
  };

  const outputPath = path.join(outputDir, "multichain-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n📄 결과 저장: ${outputPath}`);

  // 요약
  console.log("\n" + "=".repeat(60));
  console.log("🎉 배포 완료!");
  console.log("=".repeat(60));
  for (const [name, info] of Object.entries(chains)) {
    console.log(`\n  ${name} (chainId: ${info.chainId})`);
    console.log(`    PaymentReceiver : ${info.paymentReceiver}`);
    console.log(`    MockUSDC        : ${info.tokens.USDC.address}`);
    console.log(`    MockDAI         : ${info.tokens.DAI.address}`);
  }
  console.log("\n다음 단계: node server/index.js");
}

main().catch(err => {
  console.error("\n❌ 배포 실패:", err.message);
  process.exit(1);
});
